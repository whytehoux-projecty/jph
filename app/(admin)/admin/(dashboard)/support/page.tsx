import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { AdminSupportList } from '@/components/admin/AdminSupportList';

export default async function AdminSupportPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });

  const handleResolveTicket = async (formData: FormData) => {
    'use server'
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
    
    const id = formData.get('id') as string;
    const reply = formData.get('reply') as string;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    if (reply) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          title: 'Support Request Resolved',
          message: `Admin reply to "${ticket.subject}": ${reply}`,
        }
      });
    }

    revalidatePath('/admin/support');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Support Inbox</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage customer inquiries and support tickets.</p>
        </div>
      </div>

      <AdminSupportList 
        initialTickets={tickets}
        onResolveTicket={handleResolveTicket}
      />
    </div>
  );
}
