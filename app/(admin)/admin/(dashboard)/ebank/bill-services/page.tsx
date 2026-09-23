import { prisma } from '@/lib/prisma';
import { AdminBillServices } from '@/components/admin/AdminBillServices';
import { handleApproveBill, handleRejectBill, handleCreatePayee, handleDeletePayee } from '@/app/actions/adminBills';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function BillServicesPage() {
  const [payees, bills, users] = await Promise.all([
    prisma.payee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    }),
    prisma.bill.findMany({
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
    }),
    prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { lastName: 'asc' }
    })
  ]);

  return (
    <AdminPageShell 
      title="Bill Services & Providers" 
      subtitle="Configure bill payment service providers, biller categories, and review customer payment transactions."
    >
      <AdminBillServices 
        payees={payees}
        bills={bills}
        users={users}
        onCreatePayee={handleCreatePayee}
        onDeletePayee={handleDeletePayee}
        onApproveBill={handleApproveBill}
        onRejectBill={handleRejectBill}
      />
    </AdminPageShell>
  );
}
