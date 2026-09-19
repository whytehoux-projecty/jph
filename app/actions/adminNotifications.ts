'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function handleSendNotification(formData: FormData) {
  const userId = formData.get('userId') as string;
  const title = formData.get('title') as string;
  const message = formData.get('message') as string;

  if (!title || !message) return;

  if (userId === 'ALL') {
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const data = allUsers.map(u => ({
      userId: u.id,
      title,
      message,
      isRead: false
    }));
    await prisma.notification.createMany({ data });
  } else {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        isRead: false
      }
    });
  }

  revalidatePath('/admin/communications/notifications');
}
