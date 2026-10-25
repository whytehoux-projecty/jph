'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

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

/**
 * Full card details, fetched only when the customer chooses to reveal them
 * (the cards page itself only ever receives the last four digits).
 */
export async function revealCardDetails(id: string) {
  const card = await getCardById(id); // ownership check
  const exp = card.expiryDate;
  return {
    number: card.cardNumber,
    expiry: `${String(exp.getUTCMonth() + 1).padStart(2, '0')}/${String(exp.getUTCFullYear()).slice(-2)}`,
    cvv: card.cvv,
  };
}

export async function freezeCard(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await getCardById(id); // Verify ownership

  await prisma.card.update({
    where: { id },
    data: { status: 'FROZEN' }
  });

  revalidatePath('/cards');
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

  revalidatePath('/cards');
  return { success: true };
}

export async function updateLimits(id: string, limits: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await getCardById(id); // Verify ownership

  const dailyLimit = typeof limits?.dailyLimit === 'number' ? limits.dailyLimit : undefined;

  await prisma.card.update({
    where: { id },
    data: {
      ...(dailyLimit !== undefined && { dailyLimit }),
    }
  });

  revalidatePath('/cards');
  return { success: true };
}

export async function adminCreateCardDirect(data: {
  userId: string;
  accountId: string;
  cardType: string;
  cardTier?: string;
  network?: string;
  cardNumber?: string;
  cvv?: string;
  dailyLimit?: number;
  cardImageUrl?: string;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const account = await prisma.account.findUnique({ where: { id: data.accountId } });
  if (!account || account.userId !== data.userId) {
    throw new Error('Account does not belong to the specified customer.');
  }

  const prefix = data.cardType === 'CREDIT' ? '5412' : '4532';
  const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  const cardNumber = data.cardNumber || `${prefix}${randomSuffix}`;

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 4);

  const card = await prisma.card.create({
    data: {
      accountId: data.accountId,
      cardNumber,
      cardType: data.cardType,
      network: data.network || 'VISA',
      expiryDate,
      cvv: data.cvv || Math.floor(100 + Math.random() * 900).toString(),
      status: 'ACTIVE',
      cardTier: data.cardTier || 'STANDARD',
      dailyLimit: data.dailyLimit || 5000,
      cardImageUrl: data.cardImageUrl || null,
    }
  });

  revalidatePath('/cards');
  revalidatePath('/admin/ebank/cards');
  revalidatePath('/admin/customers/account-holders');
  return card;
}

export async function adminUpdateCustomerCard(cardId: string, updates: {
  status?: string;
  cardType?: string;
  cardTier?: string;
  network?: string;
  dailyLimit?: number;
  cardImageUrl?: string;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) throw new Error('Card not found');

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: updates
  });

  revalidatePath('/cards');
  revalidatePath('/admin/ebank/cards');
  revalidatePath('/admin/customers/account-holders');
  return updated;
}

export async function adminDeleteCustomerCard(cardId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.card.delete({ where: { id: cardId } });

  revalidatePath('/cards');
  revalidatePath('/admin/ebank/cards');
  revalidatePath('/admin/customers/account-holders');
  return { success: true };
}
