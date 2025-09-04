import { prisma } from '@/lib/prisma';

// 获取某个用户的可见应用列表
export async function getUserAppPermissions(userId: string) {
  return prisma.userApp.findMany({
    where: { userId, canView: true },
  });
}

// 更新或创建用户的应用权限
export async function setUserAppPermissions(userId: string, appId: string, 
  data: { canView: boolean; canUse: boolean }) {
  return prisma.userApp.upsert({
    where: { userId_appId: { userId, appId } },
    update: data,
    create: { userId, appId, ...data },
  });
}
