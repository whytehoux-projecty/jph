'use server';

import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { SUPPORT_TOPICS } from '@/lib/support-topics';

/**
 * Secure messages from signed-in customers. Each one is a support ticket that
 * staff answer in Admin › Communications › Support; their reply reaches the
 * customer as a notification.
 */
export async function sendContactMessage(data: { topic: string; subject: string; message: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const topic = (SUPPORT_TOPICS as readonly string[]).includes(data.topic) ? data.topic : null;
  const subject = data.subject?.trim().slice(0, 120);
  const message = data.message?.trim().slice(0, 4000);
  if (!topic) return { success: false as const, error: 'Choose what your message is about.' };
  if (!subject) return { success: false as const, error: 'Add a short subject.' };
  if (!message) return { success: false as const, error: 'Write your message.' };

  const reference = `MSG-${randomBytes(4).toString('hex').toUpperCase()}`;
  await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      subject: `${subject} (Ref: ${reference})`,
      message: `Topic: ${topic}\n\n${message}`,
    },
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: 'Message received',
      message: `We've received your message "${subject}" (reference ${reference}). We'll reply here in Notifications.`,
    },
  });

  revalidatePath('/support');
  revalidatePath('/admin/communications/support');
  return { success: true as const, reference };
}

/** The customer's own messages, newest first (advisory meeting requests have their own page). */
export async function getMyMessages() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id, NOT: { subject: { startsWith: '[' } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return tickets.map((t) => ({
    id: t.id,
    subject: t.subject.replace(/\s*\(Ref: [\w-]+\)$/, ''),
    reference: t.subject.match(/\(Ref: ([\w-]+)\)$/)?.[1] ?? null,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));
}
