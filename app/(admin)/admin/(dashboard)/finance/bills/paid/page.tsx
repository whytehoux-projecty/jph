import { prisma } from '@/lib/prisma';
import { AdminBillList } from '@/components/admin/AdminBillList';
import { handleApproveBill, handleRejectBill } from '@/app/actions/adminBills';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function PaidBillsPage() {
  const bills = await prisma.bill.findMany({
    where: { status: 'PAID' },
    orderBy: { createdAt: 'desc' },
    include: {
      account: {
        select: {
          accountNumber: true,
          user: { select: { firstName: true, lastName: true } }
        }
      },
      payee: {
        select: { name: true, accountNumber: true, category: true }
      }
    }
  });

  return (
    <AdminPageShell 
      title="Paid Bills" 
      subtitle="Successfully processed and paid bills."
    >
      <AdminBillList 
        initialBills={bills}
        onApprove={handleApproveBill}
        onReject={handleRejectBill}
      />
    </AdminPageShell>
  );
}
