import { prisma } from '@/lib/prisma';
import { AdminSupportList } from '@/components/admin/AdminSupportList';
import { handleResolveTicket } from '@/app/actions/adminSupport';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function AllSupportTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } }
    }
  });

  return (
    <AdminPageShell 
      title="All Support Tickets" 
      subtitle="Manage all customer inquiries and support tickets."
    >
      <AdminSupportList 
        initialTickets={tickets}
        onResolveTicket={handleResolveTicket}
      />
    </AdminPageShell>
  );
}
