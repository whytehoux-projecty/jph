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

export async function getCardRequests() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const requests = await prisma.cardRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
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

export interface RequestCardInput {
  cardType: 'DEBIT' | 'CREDIT';
  accountId?: string;
  cardTier?: string;
  cardholderName: string;
  billingAddress: string;
  requestedLimit?: number;
}

export async function requestCard(input: RequestCardInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;

  if (!input.cardholderName?.trim()) {
    throw new Error('Cardholder embossed name is required.');
  }

  if (input.cardType === 'DEBIT' && !input.accountId) {
    throw new Error('Debit cards must be linked to an active depository vault.');
  }

  // If Debit, verify user owns account
  if (input.accountId) {
    const acc = await prisma.account.findUnique({ where: { id: input.accountId } });
    if (!acc || acc.userId !== userId) {
      throw new Error('Selected depository vault was not found.');
    }
  }

  const cardRequest = await prisma.cardRequest.create({
    data: {
      userId,
      accountId: input.accountId || null,
      cardType: input.cardType,
      cardTier: input.cardTier || 'STANDARD',
      cardholderName: input.cardholderName.trim(),
      billingAddress: input.billingAddress || 'Primary Residence on File',
      requestedLimit: input.cardType === 'CREDIT' ? Number(input.requestedLimit || 5000) : null,
      status: 'PENDING',
    }
  });

  // Create an administrative notification and ticket
  await prisma.supportTicket.create({
    data: {
      userId,
      subject: `Card Application Submitted — ${input.cardTier || 'Standard'} ${input.cardType}`,
      message: `Customer ${session.user.name || userId} requested a new ${input.cardType} card. Request ID: ${cardRequest.id}.`,
      status: 'OPEN'
    }
  });

  await prisma.notification.create({
    data: {
      userId,
      title: 'Card Request Received',
      message: `Your application for a Heritage ${input.cardTier || ''} ${input.cardType} Card has been submitted for underwriting review (Ref: #${cardRequest.id.slice(-6).toUpperCase()}).`,
      isRead: false
    }
  });

  revalidatePath('/cards');
  return {
    success: true,
    request: cardRequest,
    message: 'Card application submitted successfully.'
  };
}

export interface AdminApproveCardInput {
  requestId: string;
  cardNumber?: string;
  cvv?: string;
  expiryDate?: Date | string;
  network?: string;
  cardImageUrl?: string;
  dailyLimit?: number;
}

export async function adminApproveCardRequest(input: AdminApproveCardInput) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const req = await prisma.cardRequest.findUnique({
    where: { id: input.requestId }
  });
  if (!req || req.status !== 'PENDING') {
    throw new Error('Card request not found or already processed.');
  }

  // Determine account to attach card to
  let targetAccountId = req.accountId;
  if (!targetAccountId) {
    const userAcc = await prisma.account.findFirst({
      where: { userId: req.userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });
    if (!userAcc) throw new Error('User has no active vault to link card to.');
    targetAccountId = userAcc.id;
  }

  // Generate or use card number
  const prefix = req.cardType === 'CREDIT' ? '5412' : '4532';
  const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  const cardNumber = input.cardNumber || `${prefix}${randomSuffix}`;

  const expiry = input.expiryDate
    ? new Date(input.expiryDate)
    : new Date(new Date().setFullYear(new Date().getFullYear() + 4));

  const cvv = input.cvv || Math.floor(100 + Math.random() * 900).toString();
  const network = input.network || (req.cardType === 'CREDIT' ? 'MASTERCARD' : 'VISA');

  // Create Card
  const newCard = await prisma.card.create({
    data: {
      accountId: targetAccountId,
      cardNumber,
      cardType: req.cardType,
      network,
      expiryDate: expiry,
      cvv,
      status: 'ACTIVE',
      cardTier: req.cardTier || 'STANDARD',
      cardImageUrl: input.cardImageUrl || null,
      dailyLimit: input.dailyLimit || (req.cardType === 'CREDIT' ? (req.requestedLimit || 10000) : 2500)
    }
  });

  // Update Request status
  await prisma.cardRequest.update({
    where: { id: input.requestId },
    data: {
      status: 'APPROVED',
      cardImageUrl: input.cardImageUrl || null,
    }
  });

  // Notify user
  await prisma.notification.create({
    data: {
      userId: req.userId,
      title: 'Card Approved & Issued',
      message: `Your ${req.cardType} Card has been approved and issued. Your virtual card is now active in Cards Center.`,
      isRead: false
    }
  });

  revalidatePath('/cards');
  revalidatePath('/admin/ebank/cards');
  revalidatePath('/admin/customers/account-holders');
  return { success: true, card: newCard };
}

export async function adminDeclineCardRequest(requestId: string, reason?: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const req = await prisma.cardRequest.findUnique({ where: { id: requestId } });
  if (!req) throw new Error('Card request not found');

  await prisma.cardRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || 'Application did not meet underwriting criteria.'
    }
  });

  await prisma.notification.create({
    data: {
      userId: req.userId,
      title: 'Card Application Declined',
      message: `Your ${req.cardType} Card application was declined: ${reason || 'Underwriting criteria was not met.'}`,
      isRead: false
    }
  });

  revalidatePath('/cards');
  revalidatePath('/admin/ebank/cards');
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
