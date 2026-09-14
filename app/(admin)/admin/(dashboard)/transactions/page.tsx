import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AutoRefreshHeader } from './AutoRefreshHeader';
import { AdminTransactionList } from '@/components/admin/AdminTransactionList';

export default async function TransactionsAdmin() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { account: { include: { user: true } } }
  });

  const handleApprove = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    const tx = await prisma.transaction.findUnique({ where: { id }, include: { account: true } });
    if (!tx) return;

    // Deduct or Add Balance
    const newBalance = tx.type === 'DEBIT' ? tx.account.balance - tx.amount : tx.account.balance + tx.amount;
    
    await prisma.account.update({
      where: { id: tx.accountId },
      data: { balance: newBalance }
    });

    await prisma.transaction.update({
      where: { id },
      data: { status: 'APPROVED', processedAt: new Date() }
    });

    revalidatePath('/admin/transactions');
  };

  const handleReject = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    await prisma.transaction.update({
      where: { id },
      data: { status: 'REJECTED', processedAt: new Date() }
    });
    revalidatePath('/admin/transactions');
  };

  const handleCancel = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = formData.get('id') as string;
    await prisma.transaction.update({
      where: { id },
      data: { status: 'CANCELLED', processedAt: new Date() }
    });
    revalidatePath('/admin/transactions');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Transaction Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Review and process customer transaction requests.</p>
        </div>
        <AutoRefreshHeader />
      </div>

      <AdminTransactionList 
        initialTransactions={transactions} 
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancel}
      />
    </div>
  );
}
