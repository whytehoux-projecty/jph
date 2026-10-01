import { prisma } from '@/lib/prisma';
import { AdminTransferQueue } from '@/components/admin/AdminTransferQueue';
import { handleApproveTransaction, handleRejectTransaction } from '@/app/actions/adminTransactions';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TransfersQueuePage() {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' }, // Oldest first for queue
    include: { account: { include: { user: true } } }
  });

  return (
    <AdminPageShell 
      title="Transfer Review Queue" 
      subtitle="Pending transfers requiring administrative approval."
      action={
        <div className="flex gap-2">
          <Link 
            href="/admin/ebank/transfers/settings" 
            className="flex items-center gap-2 px-4 py-2 bg-white text-ink-900 border border-neutral-200 rounded-md text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Method Settings
          </Link>
          <Link 
            href="/admin/ebank/transfers/history" 
            className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-white rounded-md text-sm font-medium hover:bg-ink-900/90 transition-colors"
          >
            View History
          </Link>
        </div>
      }
    >
      <AdminTransferQueue 
        initialTransactions={transactions} 
        onApprove={handleApproveTransaction}
        onReject={handleRejectTransaction}
      />
    </AdminPageShell>
  );
}
