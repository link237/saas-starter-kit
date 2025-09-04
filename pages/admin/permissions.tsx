import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { setUserAppPermissions } from '@/models/userApp';
import { useState } from 'react';

type AppInfo = { id: string; name: string; description: string };
type UserInfo = { id: string; name: string | null; email: string };

interface Permission {
  canView: boolean;
  canUse: boolean;
}

interface PermissionsMap {
  [userId: string]: {
    [appId: string]: Permission;
  };
}

// 服务端获取所有用户、应用和权限
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx.req, ctx.res, getAuthOptions(ctx.req, ctx.res));
  // 可根据 session 判断是否为管理员，这里暂时不做限制
  // 获取所有用户（可根据租户或团队过滤）
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });

  // 定义可配置的应用列表（与 /apps 页相同）
  const apps: AppInfo[] = [
    { id: 'zip-upload', name: '解压上传', description: '上传 ZIP 压缩包到 OSS 并自动解压，生成可访问链接。' },
    { id: 'contract-review', name: '合同审核', description: '上传合同自动生成摘要并标出风险条款。' },
    { id: 'video-generator', name: '视频生成', description: '输入脚本自动生成短视频，支持字幕合成。' }
  ];

  // 取出所有用户的权限
  const userIds = users.map((u) => u.id);
  const permsFromDb = await prisma.userApp.findMany({
    where: { userId: { in: userIds } }
  });

  // 构造权限映射
  const permissions: PermissionsMap = {};
  users.forEach((u) => {
    permissions[u.id] = {};
    apps.forEach((app) => {
      permissions[u.id][app.id] = { canView: false, canUse: false };
    });
  });
  permsFromDb.forEach((p) => {
    if (permissions[p.userId]) {
      permissions[p.userId][p.appId] = { canView: p.canView, canUse: p.canUse };
    }
  });

  return {
    props: {
      users,
      apps,
      permissions
    }
  };
}

// 权限管理组件
export default function PermissionsPage({
  users,
  apps,
  permissions
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [permState, setPermState] = useState<PermissionsMap>(permissions);

  const toggle = (userId: string, appId: string, field: keyof Permission) => {
    setPermState((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [appId]: {
          ...prev[userId][appId],
          [field]: !prev[userId][appId][field]
        }
      }
    }));
  };

  const handleSave = async () => {
    const updates: { userId: string; appId: string; canView: boolean; canUse: boolean }[] = [];
    for (const userId in permState) {
      for (const appId in permState[userId]) {
        const { canView, canUse } = permState[userId][appId];
        updates.push({ userId, appId, canView, canUse });
      }
    }
    const res = await fetch('/api/user-apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    if (res.ok) {
      alert('权限保存成功');
    } else {
      alert('保存失败，请检查服务器日志');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">权限管理</h1>
      <table className="table w-full">
        <thead>
          <tr>
            <th>用户</th>
            {apps.map((app) => (
              <th key={app.id}>
                <span title={app.description}>{app.name}</span>
                <br />
                查看 / 使用
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name || user.email}</td>
              {apps.map((app) => (
                <td key={app.id}>
                  <div className="flex flex-col items-center">
                    <label className="cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={permState[user.id][app.id].canView}
                        onChange={() => toggle(user.id, app.id, 'canView')}
                      />
                      查看
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={permState[user.id][app.id].canUse}
                        onChange={() => toggle(user.id, app.id, 'canUse')}
                      />
                      使用
                    </label>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-primary mt-4" onClick={handleSave}>
        保存
      </button>
    </div>
  );
}
