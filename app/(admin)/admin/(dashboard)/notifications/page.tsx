import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AdminNotificationList } from '@/components/admin/AdminNotificationList';

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    },
    orderBy: { lastName: 'asc' }
  });

  const handleSendNotification = async (formData: FormData) => {
    'use server'
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

    revalidatePath('/admin/notifications');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Push Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">Send alerts, maintenance notices, and messages to customers.</p>
        </div>
      </div>

      <AdminNotificationList 
        initialNotifications={notifications}
        users={users}
        onSendNotification={handleSendNotification}
      />
    </div>
  );
}
