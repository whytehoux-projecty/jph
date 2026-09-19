import { prisma } from '@/lib/prisma';
import { AdminAccountList } from '@/components/admin/AdminAccountList';
import { handleToggleAccountStatus, handleUpdateAccountBalance } from '@/app/actions/adminAccounts';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });

  return (
    <AdminPageShell 
      title="Account Management" 
      subtitle="Manage all bank accounts, adjust statuses, and override balances for demos."
    >
      <AdminAccountList 
        initialAccounts={accounts}
        onToggleStatus={handleToggleAccountStatus}
        onUpdateBalance={handleUpdateAccountBalance}
      />
    </AdminPageShell>
  );
}
