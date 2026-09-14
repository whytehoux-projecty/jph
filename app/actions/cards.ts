'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getCards() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  const accountIds = accounts.map(a => a.id);

  const cards = await prisma.card.findMany({
    where: { accountId: { in: accountIds } },
    include: { account: true },
    orderBy: { createdAt: 'desc' },
  });

  return cards;
}

export async function getCardById(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const card = await prisma.card.findUnique({
    where: { id },
    include: { account: true }
  });

  if (!card) throw new Error('Card not found');
  
  // Verify ownership
  const account = await prisma.account.findUnique({ where: { id: card.accountId } });
  if (!account || account.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  return card;
}

export async function freezeCard(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await getCardById(id); // Verify ownership

  await prisma.card.update({
    where: { id },
    data: { status: 'FROZEN' }
  });

  return { success: true };
}

export async function unfreezeCard(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await getCardById(id); // Verify ownership

  await prisma.card.update({
    where: { id },
    data: { status: 'ACTIVE' }
  });

  return { success: true };
}

export async function updateLimits(id: string, limits: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await getCardById(id); // Verify ownership

  // We could add a 'limits' JSON field to Card model or use 'metadata'
  // For demo, we assume the limits are applied successfully
  return { success: true };
}

export async function issueCard(accountId: string, cardType: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== session.user.id) throw new Error('Unauthorized');

  const cardNumber = `4000${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`;
  
  const card = await prisma.card.create({
    data: {
      accountId,
      cardNumber,
      cardType,
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
    }
  });

  return card;
}
