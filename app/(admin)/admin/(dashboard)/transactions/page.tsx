import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AutoRefreshHeader } from './AutoRefreshHeader';

export default async function TransactionsAdmin() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { account: { include: { user: true } } }
  });

  const handleApprove = async (formData: FormData) => {
    'use server'
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
    const id = formData.get('id') as string;
    await prisma.transaction.update({
      where: { id },
      data: { status: 'REJECTED', processedAt: new Date() }
    });
    revalidatePath('/admin/transactions');
  };

  return (
    <div>
      <AutoRefreshHeader />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b-2 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-4">Ref</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b dark:border-neutral-600">
                <td className="px-6 py-4 font-mono text-xs">{tx.reference}</td>
                <td className="px-6 py-4">{tx.account.user.firstName} {tx.account.user.lastName}</td>
                <td className="px-6 py-4">{tx.transactionType}</td>
                <td className="px-6 py-4 font-mono font-bold text-gray-800">${tx.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    tx.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {tx.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <form action={handleApprove}>
                        <input type="hidden" name="id" value={tx.id} />
                        <button className="text-green-600 hover:underline">Approve</button>
                      </form>
                      <form action={handleReject}>
                        <input type="hidden" name="id" value={tx.id} />
                        <button className="text-red-600 hover:underline">Reject</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <p className="p-6 text-center text-gray-500">No transactions found.</p>}
      </div>
    </div>
  );
}
