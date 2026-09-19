'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function handleResolveTicket(formData: FormData) {
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

  revalidatePath('/admin/communications/support');
}
