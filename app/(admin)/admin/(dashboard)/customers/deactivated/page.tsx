import { prisma } from '@/lib/prisma';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { deleteUserPin, loginAsUser, toggleUserStatus, toggleUserTier } from '@/app/actions/admin';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function DeactivatedAccountHoldersPage() {
  const users = await prisma.user.findMany({
    where: { status: 'SUSPENDED' },
    orderBy: { createdAt: 'desc' },
    include: {
      accounts: {
        select: { id: true, accountNumber: true, accountType: true, balance: true, status: true }
      }
    }
  });

  return (
    <AdminPageShell 
      title="Deactivated Account Holders" 
      subtitle="Customers whose access has been suspended."
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
