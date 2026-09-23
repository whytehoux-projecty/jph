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
        include: {
          cards: true,
          statements: {
            orderBy: { generatedAt: 'desc' },
            take: 10
          }
        }
      },
      registrationForm: true
    }
  });

  const formattedUsers = users.map(user => ({
    ...user,
    cards: user.accounts.flatMap(acc => acc.cards),
    statements: user.accounts.flatMap(acc => acc.statements)
  }));

  return (
    <AdminPageShell 
      title="Deactivated Account Holders" 
      subtitle="Customers whose access has been suspended."
    >
      <AdminUserList 
        initialUsers={formattedUsers}
        onToggleStatus={toggleUserStatus}
        onToggleTier={toggleUserTier}
        onDeletePin={deleteUserPin}
        onLoginAs={loginAsUser}
      />
    </AdminPageShell>
  );
}
