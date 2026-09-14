import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AdminBillList } from '@/components/admin/AdminBillList';

export default async function AdminBillsPage() {
  const bills = await prisma.bill.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      account: {
        select: {
          accountNumber: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        }
      },
      payee: {
        select: {
          name: true,
          accountNumber: true,
          category: true,
        }
      }
    }
  });

  const handleApprove = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string;
    
    // In a real system, this would debit the account. 
    // For this mock, we just mark it as PAID.
    const bill = await prisma.bill.findUnique({ where: { id }, include: { account: true } });
    if (!bill) return;

    await prisma.account.update({
      where: { id: bill.accountId },
      data: { balance: bill.account.balance - bill.amount }
    });

    await prisma.bill.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() }
    });
    
    revalidatePath('/admin/bills');
  };

  const handleReject = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string;
    
    await prisma.bill.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
    
    revalidatePath('/admin/bills');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Bill Payments</h2>
          <p className="text-sm text-muted-foreground mt-1">Review and process scheduled bill payments.</p>
        </div>
      </div>

      <AdminBillList 
        initialBills={bills}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
