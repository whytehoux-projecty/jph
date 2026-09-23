import { prisma } from '@/lib/prisma';
import { AdminBillList } from '@/components/admin/AdminBillList';
import { handleApproveBill, handleRejectBill } from '@/app/actions/adminBills';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AllBillsPage() {
  const bills = await prisma.bill.findMany({
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
      title="All Bill Payments" 
      subtitle="Review and process scheduled bill payments."
    >
      <AdminBillList 
        initialBills={bills}
        onApprove={handleApproveBill}
        onReject={handleRejectBill}
      />
    </AdminPageShell>
  );
}
