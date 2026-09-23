import { prisma } from '@/lib/prisma';
import { AdminNotificationList } from '@/components/admin/AdminNotificationList';
import { handleSendNotification } from '@/app/actions/adminNotifications';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    }
  });

  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { lastName: 'asc' }
  });

  return (
    <AdminPageShell 
      title="Push Notifications" 
      subtitle="Send alerts, maintenance notices, and messages to customers."
    >
      <AdminNotificationList 
        initialNotifications={notifications}
        users={users}
        onSendNotification={handleSendNotification}
      />
    </AdminPageShell>
  );
}
