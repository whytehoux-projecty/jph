import { prisma } from '@/lib/prisma';
import { AdminSupportList } from '@/components/admin/AdminSupportList';
import { handleResolveTicket } from '@/app/actions/adminSupport';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function ResolvedSupportTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    where: { status: 'CLOSED' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } }
    }
  });

  return (
    <AdminPageShell 
      title="Resolved Tickets" 
      subtitle="Customer inquiries that have been closed."
    >
      <AdminSupportList 
        initialTickets={tickets}
        onResolveTicket={handleResolveTicket}
      />
    </AdminPageShell>
  );
}
