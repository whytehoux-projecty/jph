import { prisma } from '@/lib/prisma';
import { AdminSupportList } from '@/components/admin/AdminSupportList';
import { handleResolveTicket } from '@/app/actions/adminSupport';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function OpenSupportTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } }
    }
  });

  return (
    <AdminPageShell 
      title="Open Support Tickets" 
      subtitle="Customer inquiries that require a response."
    >
      <AdminSupportList 
        initialTickets={tickets}
        onResolveTicket={handleResolveTicket}
      />
    </AdminPageShell>
  );
}
