import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
/// removed duplicate import of useTranslation

import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';
import { userAppsMap } from '@/lib/userApps';

// import { authOptions } from '../api/auth/[...nextauth]';
// import { prisma } from '@/lib/prisma';

// Define a type for application tiles shown on the marketplace
// Each tile includes an id, name, description, and URL for navigation


type AppTile = {
  id: string;
  name: string;
  description: string;
  url: string;
};

/**
 * getServerSideProps fetches the list of enabled applications for the current tenant or team.
 * Replace the sample data below with a call to your database or API.
 */
export const getServerSideProps: GetServerSideProps<{ apps: AppTile[] }> = async (
  ctx: GetServerSidePropsContext
) => {
  // TODO: Resolve the team ID from session if you have multi-tenant logic
  // const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const authOptions = getAuthOptions(ctx.req, ctx.res);
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const email = session?.user?.email ?? '';
  const allowedAppIds = userAppsMap[email] ?? [];

  // const teamId = session?.teamId;

  // TODO: Fetch the list of apps enabled for the team from your database or API
  const apps: AppTile[] = [
    {
      id: 'zip-upload',
      name: '解压上传',
      description: '上传 ZIP 压缩包到 OSS 并自动解压，生成可访问链接。',
      url: '/tools/zip-upload'
    },
    {
      id: 'contract-review',
      name: '合同审核',
      description: '上传合同自动生成摘要并标出风险条款。',
      url: '/tools/contract-review'
    },
//    //    const authOptions = getAuthOptions(ctx.req, ctx.res);
//   c// onst session = await getServerSession(ctx.req, ctx.res, authOptions);
//   c// onst email = session?.user?.email ?? '';
//   c// onst allowedAppIds = userAppsMap[email] ?? [];

    {
      id: 'video-generator',
      name: '视频生成',
      description: '输入脚本自动生成短视频，支持字幕合成。',
      url: '/tools/video-generator'
    }
  ];

  const filteredApps = apps.filter(app => allowedAppIds.includes(app.id));

  return {
    props: {
    : apps: filteredApps
    }
  };
};

/**
 * 应用广场页面: 显示当前租户已启用的 AI 应用列表，以磁贴方式呈现。
 */
export default function AppsPage({ apps }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation('common');
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">应用广场</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="card bg-base-100 shadow-md h-full">
            <div className="card-body flex flex-col">
              <h2 className="card-title">{app.name}</h2>
              <p className="flex-grow">{app.description}</p>
              <div className="pt-4">
                <Link href={app.url} className="btn btn-primary">
                  打开
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
