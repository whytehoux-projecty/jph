import { prisma } from '@/lib/prisma';
import { AdminTransactionList } from '@/components/admin/AdminTransactionList';
import { handleApproveTransaction, handleRejectTransaction, handleCancelTransaction } from '@/app/actions/adminTransactions';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function ApprovedTransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    include: { account: { include: { user: true } } }
  });

  return (
    <AdminPageShell 
      title="Approved Transactions" 
      subtitle="Transactions that have been successfully processed."
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
