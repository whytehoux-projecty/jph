import { prisma } from '@/lib/prisma';
import { AdminTransactionList } from '@/components/admin/AdminTransactionList';
import { handleApproveTransaction, handleRejectTransaction, handleCancelTransaction } from '@/app/actions/adminTransactions';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AllTransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { account: { include: { user: true } } }
  });

  return (
    <AdminPageShell 
      title="All Transactions" 
      subtitle="Review all financial transactions across the system."
    >
      <AdminTransactionList 
        initialTransactions={transactions} 
        onApprove={handleApproveTransaction}
        onReject={handleRejectTransaction}
        onCancel={handleCancelTransaction}
      />
    </AdminPageShell>
  );
}
