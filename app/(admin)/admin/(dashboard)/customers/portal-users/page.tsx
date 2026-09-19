import { prisma } from '@/lib/prisma';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { deleteUserPin, loginAsUser, toggleUserStatus, toggleUserTier } from '@/app/actions/admin';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function PortalUsersPage() {
  const users = await prisma.user.findMany({
    where: { hasOnlineAccess: true },
    orderBy: { createdAt: 'desc' },
    include: {
      accounts: {
        select: { id: true, accountNumber: true, accountType: true, balance: true, status: true }
      }
    }
  });

  return (
    <AdminPageShell 
      title="e-Portal Access Users" 
      subtitle="Customers who have been granted access to the online banking portal."
    >
      <AdminUserList 
        initialUsers={users}
        onToggleStatus={toggleUserStatus}
        onToggleTier={toggleUserTier}
        onDeletePin={deleteUserPin}
        onLoginAs={loginAsUser}
      />
    </AdminPageShell>
  );
}
