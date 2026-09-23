import { prisma } from '@/lib/prisma';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { deleteUserPin, loginAsUser, toggleUserStatus, toggleUserTier, toggleUserOnlineAccess } from '@/app/actions/admin';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AllAccountHoldersPage() {
  const users = await prisma.user.findMany({
    where: {},
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
      title="All Account Holders" 
      subtitle="Manage all customer accounts across all statuses."
    >
      <AdminUserList 
        initialUsers={formattedUsers}
        onToggleStatus={toggleUserStatus}
        onToggleTier={toggleUserTier}
        onDeletePin={deleteUserPin}
        onLoginAs={loginAsUser}
        onToggleOnlineAccess={toggleUserOnlineAccess}
      />
    </AdminPageShell>
  );
}
