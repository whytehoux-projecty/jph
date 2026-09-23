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
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-md text-sm font-medium hover:bg-charcoal/90 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export CSV
        </button>
      }
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
