'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return notifications;
}

export async function markAsRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== session.user.id) throw new Error('Unauthorized');

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  return { success: true };
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true }
  });

  return { success: true };
}
