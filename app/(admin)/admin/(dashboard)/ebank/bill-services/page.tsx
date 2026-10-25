import { prisma } from '@/lib/prisma';
import { AdminBillServices } from '@/components/admin/AdminBillServices';
import { handleApproveBill, handleRejectBill, handleCreatePayee, handleDeletePayee } from '@/app/actions/adminBills';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function BillServicesPage() {
  const [payees, rawBills, users, billTxs] = await Promise.all([
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
            id: true,
            accountNumber: true,
            accountType: true,
            balance: true,
            currency: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } }
          }
        },
        payee: {
          select: { id: true, name: true, accountNumber: true, category: true, country: true }
        }
      }
    }),
    prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { lastName: 'asc' }
    }),
    prisma.transaction.findMany({
      where: { transactionType: 'BILL_PAYMENT', metadata: { contains: '"attachmentId"' } },
      select: { metadata: true },
    }),
  ]);

  // Attached bills, keyed by bill id (portal payments record both in metadata).
  const attachments = new Map<string, string>();
  for (const t of billTxs) {
    try {
      const m = JSON.parse(t.metadata || '{}');
      if (m.billId && m.attachmentId) attachments.set(m.billId, m.attachmentId);
    } catch {
      /* ignore malformed metadata */
    }
  }
  const bills = rawBills.map((b) => ({ ...b, attachmentId: attachments.get(b.id) ?? null }));

  return (
    <AdminPageShell 
      title="Bill Services & Providers" 
      subtitle="Review customer bill payments, and add billers for a customer."
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
