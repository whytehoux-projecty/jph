import { prisma } from '@/lib/prisma';
import { AdminTransferHistory } from '@/components/admin/AdminTransferHistory';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TransfersHistoryPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { account: { include: { user: true } } },
    where: {
      OR: [
        { transactionType: { in: ['LOCAL_TRANSFER', 'INT_WIRE', 'CRYPTO_WITHDRAWAL'] } },
        { methodId: { not: null } }
      ]
    }
  });

  return (
    <AdminPageShell 
      title="Transfer History" 
      subtitle="Complete log of all transfer activities."
      action={
        <Link 
          href="/admin/ebank/transfers" 
          className="flex items-center gap-2 px-4 py-2 bg-white text-charcoal border border-neutral-200 rounded-md text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
      }
    >
      <AdminTransferHistory initialTransactions={transactions} />
    </AdminPageShell>
  );
}
