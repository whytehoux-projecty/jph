'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return session;
}

// -----------------------------------------------------------------------------
// DEPOSITS MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminDeposits() {
  await checkAdmin();

  const deposits = await prisma.transaction.findMany({
    where: {
      OR: [
        { category: 'DEPOSIT' },
        {
          transactionType: {
            in: ['CASH_DEPOSIT', 'VIRTUAL_DEPOSIT', 'CHECK_DEPOSIT', 'CARD_DEPOSIT', 'CRYPTO_DEPOSIT', 'DEPOSIT'],
          },
        },
      ],
    },
    include: {
      account: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return deposits.map((d) => ({
    id: d.id,
    reference: d.reference,
    amount: d.amount,
    currency: d.currency,
    status: d.status,
    description: d.description,
    methodId: d.methodId || 'deposit',
    transactionType: d.transactionType,
    createdAt: d.createdAt.toISOString(),
    accountNumber: d.account.accountNumber,
    accountType: d.account.accountType,
    customerName: `${d.account.user.firstName} ${d.account.user.lastName}`,
    customerEmail: d.account.user.email,
    customerId: d.account.user.id,
    metadata: d.metadata,
  }));
}

export async function approveDeposit(txId: string) {
  await checkAdmin();

  const tx = await prisma.transaction.findUnique({
    where: { id: txId },
    include: { account: true },
  });

  if (!tx) throw new Error('Transaction not found');
  if (tx.status === 'APPROVED') return { success: true };

  // Credit the account
  const updatedAccount = await prisma.account.update({
    where: { id: tx.accountId },
    data: { balance: { increment: tx.amount } },
  });

  // Mark transaction approved
  await prisma.transaction.update({
    where: { id: txId },
    data: {
      status: 'APPROVED',
      processedAt: new Date(),
      runningBalance: updatedAccount.balance,
    },
  });

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: tx.account.userId,
      title: 'Deposit Cleared & Credited',
      message: `Your deposit of $${tx.amount.toLocaleString()} (Ref: ${tx.reference}) has been cleared and credited to your ${tx.account.accountType} account.`,
    },
  });

  revalidatePath('/admin/ebank/deposits');
  revalidatePath('/admin/transactions');
  revalidatePath('/deposit');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function rejectDeposit(txId: string, reason: string) {
  await checkAdmin();

  const tx = await prisma.transaction.findUnique({
    where: { id: txId },
    include: { account: true },
  });

  if (!tx) throw new Error('Transaction not found');

  await prisma.transaction.update({
    where: { id: txId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || 'Deposit verification failed institutional underwriting criteria.',
      processedAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: tx.account.userId,
      title: 'Deposit Verification Notice',
      message: `Deposit ref ${tx.reference} could not be completed. Reason: ${reason || 'Institutional compliance check.'}`,
    },
  });

  revalidatePath('/admin/ebank/deposits');
  revalidatePath('/admin/transactions');
  revalidatePath('/deposit');
  return { success: true };
}

// -----------------------------------------------------------------------------
// LOANS & UNDERWRITING MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminLoans() {
  await checkAdmin();

  const loans = await prisma.transaction.findMany({
    where: {
      OR: [
        { category: 'LOAN' },
        { transactionType: 'LOAN_APPLICATION' },
      ],
    },
    include: {
      account: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return loans.map((l) => ({
    id: l.id,
    reference: l.reference,
    amount: l.amount,
    currency: l.currency,
    status: l.status,
    description: l.description,
    methodId: l.methodId,
    createdAt: l.createdAt.toISOString(),
    accountNumber: l.account.accountNumber,
    accountType: l.account.accountType,
    customerName: `${l.account.user.firstName} ${l.account.user.lastName}`,
    customerEmail: l.account.user.email,
    customerId: l.account.user.id,
    metadata: l.metadata,
  }));
}

export async function approveAndDisburseLoan(txId: string) {
  await checkAdmin();

  const tx = await prisma.transaction.findUnique({
    where: { id: txId },
    include: { account: true },
  });

  if (!tx) throw new Error('Loan transaction not found');
  if (tx.status === 'APPROVED') return { success: true };

  // Instant fund disbursement into the customer's account
  const updatedAccount = await prisma.account.update({
    where: { id: tx.accountId },
    data: { balance: { increment: tx.amount } },
  });

  await prisma.transaction.update({
    where: { id: txId },
    data: {
      status: 'APPROVED',
      processedAt: new Date(),
      runningBalance: updatedAccount.balance,
      adminNote: 'Underwritten & instantly disbursed by Institutional Credit Desk.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: tx.account.userId,
      title: 'Loan Approved & Disbursed',
      message: `Your loan facility (Ref: ${tx.reference}) has been approved! The loan principal of $${tx.amount.toLocaleString()} has been disbursed directly into your ${tx.account.accountType} account.`,
    },
  });

  revalidatePath('/admin/ebank/loans');
  revalidatePath('/admin/transactions');
  revalidatePath('/savings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function rejectLoan(txId: string, reason: string) {
  await checkAdmin();

  const tx = await prisma.transaction.findUnique({
    where: { id: txId },
    include: { account: true },
  });

  if (!tx) throw new Error('Loan transaction not found');

  await prisma.transaction.update({
    where: { id: txId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || 'Does not meet current institutional lending portfolio thresholds.',
      processedAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: tx.account.userId,
      title: 'Loan Application Decision',
      message: `Your credit request (Ref: ${tx.reference}) was reviewed. Decision: Declined. Reason: ${reason || 'Portfolio criteria.'}`,
    },
  });

  revalidatePath('/admin/ebank/loans');
  revalidatePath('/admin/transactions');
  revalidatePath('/savings');
  return { success: true };
}

// -----------------------------------------------------------------------------
// BENEFITS & CONCIERGE MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminBenefits() {
  await checkAdmin();

  const [redemptions, tickets, users] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        OR: [
          { category: 'REWARDS' },
          { transactionType: 'REWARD_REDEMPTION' },
        ],
      },
      include: {
        account: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.supportTicket.findMany({
      where: {
        OR: [
          { subject: { startsWith: '[Private Advisory Booking]' } },
          { subject: { startsWith: '[Lifestyle Concierge Request]' } },
        ],
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        tier: true,
        transferMethodOverrides: true,
      },
      orderBy: { lastName: 'asc' },
    }),
  ]);

  return {
    redemptions: redemptions.map((r) => ({
      id: r.id,
      reference: r.reference,
      amount: r.amount,
      status: r.status,
      description: r.description,
      createdAt: r.createdAt.toISOString(),
      customerName: `${r.account.user.firstName} ${r.account.user.lastName}`,
      customerEmail: r.account.user.email,
      customerId: r.account.user.id,
    })),
    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      message: t.message,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      customerName: `${t.user.firstName} ${t.user.lastName}`,
      customerEmail: t.user.email,
      customerId: t.user.id,
      isAdvisory: t.subject.startsWith('[Private Advisory Booking]'),
      isConcierge: t.subject.startsWith('[Lifestyle Concierge Request]'),
    })),
    users,
  };
}

export async function resolveBenefitTicket(ticketId: string, notes?: string) {
  await checkAdmin();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) throw new Error('Ticket not found');

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: 'RESOLVED' },
  });

  await prisma.notification.create({
    data: {
      userId: ticket.userId,
      title: ticket.subject.startsWith('[Private Advisory Booking]')
        ? 'Advisory Session Confirmed by Director'
        : 'Concierge Request Fulfilled',
      message: notes || `Your request (${ticket.subject}) has been processed and confirmed by the Executive Wealth team.`,
    },
  });

  revalidatePath('/admin/ebank/benefits');
  revalidatePath('/admin/ebank/support');
  revalidatePath('/benefits');
  return { success: true };
}
