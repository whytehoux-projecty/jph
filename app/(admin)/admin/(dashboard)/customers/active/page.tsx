import { prisma } from '@/lib/prisma';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { deleteUserPin, loginAsUser, toggleUserStatus, toggleUserTier, toggleUserOnlineAccess } from '@/app/actions/admin';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function ActiveAccountHoldersPage() {
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      accounts: {
        include: {
          cards: true,
          cheques: true,
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
    cheques: user.accounts.flatMap(acc => acc.cheques),
    statements: user.accounts.flatMap(acc => acc.statements)
  }));

  return (
    <AdminPageShell 
      title="Active Account Holders" 
      subtitle="Customers currently in good standing."
    >
      <AdminUserList 
        initialUsers={formattedUsers}
        onLoginAs={loginAsUser}
      />
    </AdminPageShell>
  );
}
