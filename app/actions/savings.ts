'use server';

import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type LoanMethodsOverrides } from '@/lib/feature-overrides';
import { checkTransactionPin } from '@/lib/transaction-pin';
import { loanProduct } from '@/lib/loan-products';
import { InsufficientFunds, moveIntoGoal } from '@/lib/savings-money';
import {
  isValidScheduleDay,
  nextContributionDate,
  type ContributionMode,
  type Frequency,
} from '@/lib/savings-schedule';

export interface UserLoanPermissions {
  enabled: boolean;
  methods: LoanMethodsOverrides;
}

export async function getUserLoanPermissions(): Promise<UserLoanPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      enabled: false,
      methods: { auto: false, mortgage: false, personal: false, heloc: false, business: false },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { transferMethodOverrides: true },
  });

  const parsed = parseUserFeatureOverrides(user?.transferMethodOverrides);
  return {
    enabled: parsed.loans.enabled,
    methods: parsed.loans.methods,
  };
}

const reference = (prefix: string) => `${prefix}-${randomBytes(5).toString('hex').toUpperCase()}`;

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

/** One of the customer's own, active accounts at this bank. */
async function ownActiveAccount(userId: string, accountId: string | null | undefined) {
  if (!accountId) return null;
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== userId || account.isExternal || account.status !== 'ACTIVE') return null;
  return account;
}

function revalidateSavings() {
  revalidatePath('/savings');
  revalidatePath('/dashboard');
  revalidatePath('/activities');
}

// -----------------------------------------------------------------------------
// Savings goals
// -----------------------------------------------------------------------------

export async function getSavingsGoals() {
  const userId = await requireUser();
  return prisma.savingsGoal.findMany({
    where: { userId },
    include: { account: { select: { id: true, accountType: true, accountNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export interface GoalPlanInput {
  accountId: string;
  mode: ContributionMode;
  amount?: number;
  frequency?: Frequency;
  scheduleDay?: number;
  /** Needed to turn on automatic contributions: they move money without asking again. */
  pin?: string;
}

export interface GoalResult {
  success: boolean;
  id?: string;
  error?: string;
  field?: 'pin';
}

/** Validates a plan and works out its first contribution date. */
async function resolvePlan(userId: string, plan: GoalPlanInput) {
  const account = await ownActiveAccount(userId, plan.accountId);
  if (!account) return { error: 'Choose one of your active accounts.' } as const;

  if (plan.mode === 'NONE') {
    return { data: { accountId: account.id, contributionMode: 'NONE', contributionAmount: null, frequency: null, scheduleDay: null, nextContributionAt: null } } as const;
  }
  if (plan.mode !== 'AUTO' && plan.mode !== 'MANUAL') return { error: 'Choose how you want to save.' } as const;
  const amount = Number(plan.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Enter how much to save each time.' } as const;
  if (plan.frequency !== 'WEEKLY' && plan.frequency !== 'MONTHLY') return { error: 'Choose weekly or monthly.' } as const;
  if (!isValidScheduleDay(plan.frequency, Number(plan.scheduleDay))) return { error: 'Choose the day to save on.' } as const;

  if (plan.mode === 'AUTO') {
    const pinError = await checkTransactionPin(userId, plan.pin || '', 'turning on automatic saving');
    if (pinError) return { error: pinError, field: 'pin' } as const;
  }

  return {
    data: {
      accountId: account.id,
      contributionMode: plan.mode,
      contributionAmount: amount,
      frequency: plan.frequency,
      scheduleDay: Number(plan.scheduleDay),
      nextContributionAt: nextContributionDate(plan.frequency, Number(plan.scheduleDay), new Date()),
    },
  } as const;
}

export async function createSavingsGoal(input: { name: string; targetAmount: number; targetDate: string } & GoalPlanInput): Promise<GoalResult> {
  const userId = await requireUser();

  const name = input.name?.trim();
  if (!name || name.length > 80) return { success: false, error: 'Give your goal a name.' };
  const targetAmount = Number(input.targetAmount);
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) return { success: false, error: 'Enter how much you want to save.' };
  const targetDate = new Date(input.targetDate);
  if (Number.isNaN(targetDate.getTime()) || targetDate <= new Date()) return { success: false, error: 'Choose a date in the future.' };

  const plan = await resolvePlan(userId, input);
  if ('error' in plan) return { success: false, error: plan.error, field: 'field' in plan ? plan.field : undefined };

  const goal = await prisma.savingsGoal.create({
    data: { userId, name, targetAmount, targetDate, currentAmount: 0, ...plan.data },
  });

  revalidateSavings();
  return { success: true, id: goal.id };
}

export async function updateGoalPlan(goalId: string, input: GoalPlanInput): Promise<GoalResult> {
  const userId = await requireUser();
  const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, userId } });
  if (!goal) return { success: false, error: "We couldn't find that goal." };

  const plan = await resolvePlan(userId, input);
  if ('error' in plan) return { success: false, error: plan.error, field: 'field' in plan ? plan.field : undefined };

  await prisma.savingsGoal.update({ where: { id: goal.id }, data: plan.data });
  revalidateSavings();
  return { success: true, id: goal.id };
}

/** Moves money from one of the customer's accounts into a goal. */
export async function contributeToGoal(goalId: string, amount: number, accountId: string, pin: string): Promise<GoalResult & { reference?: string }> {
  const userId = await requireUser();
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: 'Enter an amount greater than zero.' };

  const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, userId } });
  if (!goal) return { success: false, error: "We couldn't find that goal." };
  const account = await ownActiveAccount(userId, accountId);
  if (!account) return { success: false, error: 'Choose one of your active accounts.' };

  const pinError = await checkTransactionPin(userId, pin, 'saving');
  if (pinError) return { success: false, error: pinError, field: 'pin' };

  const ref = reference('SAV');
  try {
    await moveIntoGoal({ goalId: goal.id, goalName: goal.name, accountId: account.id, amount, reference: ref, automatic: false });
  } catch (err) {
    return { success: false, error: err instanceof InsufficientFunds ? err.message : 'We couldn\'t move the money. Try again.' };
  }

  revalidateSavings();
  return { success: true, id: goal.id, reference: ref };
}

/** Moves money set aside in a goal back into one of the customer's accounts. */
export async function releaseFromGoal(goalId: string, amount: number, accountId: string, pin: string): Promise<GoalResult & { reference?: string }> {
  const userId = await requireUser();
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: 'Enter an amount greater than zero.' };

  const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, userId } });
  if (!goal) return { success: false, error: "We couldn't find that goal." };
  const account = await ownActiveAccount(userId, accountId);
  if (!account) return { success: false, error: 'Choose one of your active accounts.' };

  const pinError = await checkTransactionPin(userId, pin, 'moving money');
  if (pinError) return { success: false, error: pinError, field: 'pin' };

  const ref = reference('SAV');
  try {
    await prisma.$transaction(async (db) => {
      const taken = await db.savingsGoal.updateMany({
        where: { id: goal.id, currentAmount: { gte: amount } },
        data: { currentAmount: { decrement: amount } },
      });
      if (taken.count === 0) throw new InsufficientFunds("That's more than this goal holds.");
      const credited = await db.account.update({ where: { id: account.id }, data: { balance: { increment: amount } } });
      await db.transaction.create({
        data: {
          accountId: account.id,
          type: 'CREDIT',
          transactionType: 'SAVINGS_RELEASE',
          amount,
          currency: account.currency,
          status: 'COMPLETED',
          description: `Moved back from savings goal · ${goal.name}`,
          reference: ref,
          category: 'SAVINGS',
          channel: 'PORTAL',
          processedAt: new Date(),
          runningBalance: credited.balance,
          metadata: JSON.stringify({ goalId: goal.id, goalName: goal.name }),
        },
      });
    });
  } catch (err) {
    return { success: false, error: err instanceof InsufficientFunds ? err.message : 'We couldn\'t move the money. Try again.' };
  }

  revalidateSavings();
  return { success: true, id: goal.id, reference: ref };
}

/** Deletes a goal. Only an empty goal can go, so money set aside can't vanish. */
export async function deleteSavingsGoal(goalId: string): Promise<GoalResult> {
  const userId = await requireUser();
  const removed = await prisma.savingsGoal.deleteMany({ where: { id: goalId, userId, currentAmount: { lte: 0 } } });
  if (removed.count === 0) {
    return { success: false, error: 'Move the money in this goal back to an account before deleting it.' };
  }
  revalidateSavings();
  return { success: true };
}

// -----------------------------------------------------------------------------
// Credit score
// -----------------------------------------------------------------------------

/** The latest score staff recorded for the customer, or null when there is none. */
export async function getUserCreditScore(): Promise<{ score: number; change: number; month: string } | null> {
  const userId = await requireUser();
  const cs = await prisma.creditScore.findFirst({ where: { userId }, orderBy: { month: 'desc' } });
  return cs ? { score: cs.score, change: cs.change || 0, month: cs.month } : null;
}

// -----------------------------------------------------------------------------
// Loan applications
// -----------------------------------------------------------------------------

export interface LoanApplicationInput {
  productId: string;
  amount: number;
  termMonths?: number;
  purpose: string;
  annualIncome: number;
  employmentStatus: string;
  targetAccountId: string;
}

export interface LoanApplicationResult {
  success: boolean;
  reference?: string;
  id?: string;
  error?: string;
}

/**
 * Sends a loan application to staff (Admin › E-bank › Loans). It is not an
 * approval or an offer: staff review it and, if they approve, disburse it.
 */
export async function submitLoanApplication(data: LoanApplicationInput): Promise<LoanApplicationResult> {
  const userId = await requireUser();

  const product = loanProduct(data.productId);
  if (!product) return { success: false, error: 'Choose a loan.' };

  const permissions = await getUserLoanPermissions();
  if (!permissions.enabled || permissions.methods[product.permission] === false) {
    return { success: false, error: 'Applying for this loan online is turned off for your profile. Contact us to apply.' };
  }

  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: 'Enter how much you want to borrow.' };
  if (product.minAmount && amount < product.minAmount) return { success: false, error: `The smallest ${product.name.toLowerCase()} is $${product.minAmount.toLocaleString()}.` };
  if (product.maxAmount && amount > product.maxAmount) return { success: false, error: `The largest ${product.name.toLowerCase()} is $${product.maxAmount.toLocaleString()}.` };
  const termMonths = data.termMonths ? Number(data.termMonths) : undefined;
  if (termMonths !== undefined && (!Number.isInteger(termMonths) || termMonths < 6 || termMonths > 480)) {
    return { success: false, error: 'Enter a term between 6 and 480 months, or leave it blank.' };
  }
  const annualIncome = Number(data.annualIncome);
  if (!Number.isFinite(annualIncome) || annualIncome < 0) return { success: false, error: 'Enter your yearly income before tax.' };
  const purpose = data.purpose?.trim();
  if (!purpose) return { success: false, error: 'Tell us what the loan is for.' };

  const account = await ownActiveAccount(userId, data.targetAccountId);
  if (!account) return { success: false, error: 'Choose the account the money should go into.' };

  const ref = reference('LN');
  const tx = await prisma.transaction.create({
    data: {
      accountId: account.id,
      type: 'CREDIT',
      amount,
      currency: account.currency,
      description: `Loan application · ${product.name}`,
      status: 'PENDING',
      category: 'LOAN',
      transactionType: 'LOAN_APPLICATION',
      methodId: product.id,
      reference: ref,
      channel: 'PORTAL',
      metadata: JSON.stringify({
        loanName: product.name,
        publishedRate: product.rate,
        termMonths,
        purpose: purpose.slice(0, 500),
        annualIncome,
        employmentStatus: data.employmentStatus,
      }),
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: 'Loan application received',
      message: `We've received your application for a ${product.name.toLowerCase()} of $${amount.toLocaleString()} (reference ${ref}). A lending specialist will review it and let you know the outcome.`,
    },
  });

  revalidatePath('/savings');
  revalidatePath('/admin/ebank/loans');
  return { success: true, reference: ref, id: tx.id };
}

export async function getRecentLoanApplications() {
  const userId = await requireUser();
  const txs = await prisma.transaction.findMany({
    where: { account: { userId }, category: 'LOAN', transactionType: 'LOAN_APPLICATION' },
    include: { account: { select: { accountType: true, accountNumber: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return txs.map((tx) => {
    let meta: Record<string, any> = {};
    try {
      meta = tx.metadata ? JSON.parse(tx.metadata) : {};
    } catch {
      /* keep defaults */
    }
    return {
      id: tx.id,
      reference: tx.reference,
      loanName: (meta.loanName as string) || tx.description,
      amount: tx.amount,
      currency: tx.currency,
      termMonths: typeof meta.termMonths === 'number' ? meta.termMonths : null,
      status: tx.status,
      rejectionReason: tx.rejectionReason,
      createdAt: tx.createdAt.toISOString(),
      accountType: tx.account.accountType,
      accountNumber: tx.account.accountNumber,
    };
  });
}
