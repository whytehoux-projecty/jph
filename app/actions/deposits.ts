'use server';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type DepositMethodsOverrides } from '@/lib/feature-overrides';
import { isValidBic, isValidRouting } from '@/lib/transfer-forms/validators';
import { TELLER_ORDER_MINIMUM } from '@/lib/deposit-rules';

/** Deposit methods the portal offers. Card top-ups were removed: there is no card processor. */
export type DepositMethod = 'cash' | 'virtual' | 'check' | 'crypto';

export interface DepositSubmissionData {
  accountId: string;
  method: DepositMethod;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  /** Cheque deposits only: ids returned by POST /api/deposits/images. */
  chequeImageIds?: { front: string; back: string };
}

export interface DepositResult {
  success: boolean;
  reference?: string;
  id?: string;
  error?: string;
}

export interface UserDepositPermissions {
  enabled: boolean;
  methods: DepositMethodsOverrides;
}

/** Unguessable, human-readable reference, e.g. DEP-7F3A09C21B. */
function newReference(prefix: 'DEP' | 'WTH') {
  return `${prefix}-${randomBytes(5).toString('hex').toUpperCase()}`;
}

/** An account the signed-in customer owns at this bank and can use. */
async function ownActiveAccount(userId: string, accountId: string) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== userId || account.isExternal) return null;
  return account.status === 'ACTIVE' ? account : null;
}

export async function getUserDepositPermissions(): Promise<UserDepositPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      enabled: false,
      methods: { cash: false, virtual: false, check: false, card: false, crypto: false },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { transferMethodOverrides: true },
  });

  const parsed = parseUserFeatureOverrides(user?.transferMethodOverrides);
  return {
    enabled: parsed.deposits.enabled,
    methods: parsed.deposits.methods,
  };
}

const METHOD_LABELS: Record<DepositMethod, { type: string; label: string }> = {
  cash: { type: 'CASH_DEPOSIT', label: 'Cash deposit at a branch' },
  virtual: { type: 'VIRTUAL_DEPOSIT', label: 'Incoming bank transfer' },
  check: { type: 'CHECK_DEPOSIT', label: 'Mobile cheque deposit' },
  crypto: { type: 'CRYPTO_DEPOSIT', label: 'Stablecoin deposit' },
};

export async function submitDeposit(data: DepositSubmissionData): Promise<DepositResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  const userId = session.user.id;

  const { accountId, method, amount, currency = 'USD', description, metadata = {}, chequeImageIds } = data;

  if (!METHOD_LABELS[method]) {
    return { success: false, error: 'This deposit method is not available.' };
  }

  // Customer-level deposit permissions set by an administrator.
  const permissions = await getUserDepositPermissions();
  if (!permissions.enabled) {
    return {
      success: false,
      error: 'Deposits are turned off for your profile. Contact us if you need to add money.',
    };
  }
  if (permissions.methods[method] === false) {
    return { success: false, error: 'This deposit method is turned off for your profile. Contact us for help.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: 'Enter an amount greater than zero.' };
  }

  const account = await ownActiveAccount(userId, accountId);
  if (!account) {
    return { success: false, error: 'Choose one of your active accounts.' };
  }

  if (method === 'cash') {
    const locations = await getDepositLocations();
    if (!locations.some((l) => l.id === metadata.locationId)) {
      return { success: false, error: 'Choose a branch from the list.' };
    }
  }

  let imageIds: string[] = [];
  if (method === 'check') {
    if (!chequeImageIds?.front || !chequeImageIds?.back || chequeImageIds.front === chequeImageIds.back) {
      return { success: false, error: 'Add photos of the front and back of the cheque.' };
    }
    imageIds = [chequeImageIds.front, chequeImageIds.back];
    // Both images must be this customer's, of the right side, and not used by another deposit.
    const images = await prisma.depositImage.findMany({
      where: { id: { in: imageIds }, userId, transactionId: null },
      select: { id: true, side: true },
    });
    const sides = new Map(images.map((i) => [i.id, i.side]));
    if (sides.get(chequeImageIds.front) !== 'FRONT' || sides.get(chequeImageIds.back) !== 'BACK') {
      return { success: false, error: 'The cheque photos have expired. Add them again.' };
    }
  }

  const methodInfo = METHOD_LABELS[method];
  const tx = await prisma.$transaction(async (db) => {
    const created = await db.transaction.create({
      data: {
        accountId,
        type: 'CREDIT',
        transactionType: methodInfo.type,
        amount: Number(amount),
        currency,
        status: 'PENDING',
        description: description || methodInfo.label,
        reference: newReference('DEP'),
        methodId: method,
        category: 'DEPOSIT',
        channel: 'PORTAL_DEPOSIT',
        metadata: JSON.stringify({
          ...metadata,
          ...(imageIds.length ? { chequeImageIds: { front: imageIds[0], back: imageIds[1] } } : {}),
          depositMethod: method,
          accountType: account.accountType,
          timestamp: new Date().toISOString(),
        }),
      },
    });
    if (imageIds.length) {
      await db.depositImage.updateMany({
        where: { id: { in: imageIds }, userId, transactionId: null },
        data: { transactionId: created.id },
      });
    }
    return created;
  });

  revalidatePath('/deposit');
  revalidatePath('/dashboard');
  revalidatePath('/activities');
  revalidatePath('/vaults');

  return { success: true, reference: tx.reference, id: tx.id };
}

export interface RecentMoneyMovement {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  methodId: string | null;
  direction: 'in' | 'out';
  createdAt: string;
  accountType: string;
  /** Last four digits only. */
  accountLast4: string;
}

/** The customer's recent deposits and withdrawal requests made from this page. */
export async function getRecentDeposits(limit = 8): Promise<RecentMoneyMovement[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { id: true, accountType: true, accountNumber: true },
  });
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const txs = await prisma.transaction.findMany({
    where: {
      accountId: { in: accounts.map((a) => a.id) },
      OR: [{ category: 'DEPOSIT' }, { category: 'CASH_WITHDRAWAL' }],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return txs.map((t) => {
    const account = accountMap.get(t.accountId)!;
    return {
      id: t.id,
      reference: t.reference,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      description: t.description,
      methodId: t.methodId,
      direction: t.type === 'DEBIT' ? 'out' : 'in',
      createdAt: t.createdAt.toISOString(),
      accountType: account.accountType,
      accountLast4: account.accountNumber.slice(-4),
    };
  });
}

export interface BankRoutingDetails {
  bankName: string;
  bankAddress: string;
  achRouting: string;
  wireRouting: string;
  swiftBic?: string;
}

/**
 * The details other banks need to send money to a customer's account. They
 * are the bank's own and must never be invented, so they come only from
 * BANK_DEPOSIT_DETAILS (a JSON BankRoutingDetails). Returns null when they're
 * missing or fail validation; the portal then sends customers to support.
 */
export async function getBankRoutingDetails(): Promise<BankRoutingDetails | null> {
  const raw = process.env.BANK_DEPOSIT_DETAILS;
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    const ok =
      typeof d?.bankName === 'string' && d.bankName &&
      typeof d?.bankAddress === 'string' && d.bankAddress &&
      isValidRouting(String(d.achRouting ?? '')) &&
      isValidRouting(String(d.wireRouting ?? '')) &&
      (d.swiftBic === undefined || isValidBic(String(d.swiftBic)));
    if (!ok) {
      console.error('[deposits] BANK_DEPOSIT_DETAILS is incomplete or has an invalid routing/BIC; not shown.');
      return null;
    }
    return {
      bankName: d.bankName,
      bankAddress: d.bankAddress,
      achRouting: String(d.achRouting),
      wireRouting: String(d.wireRouting),
      swiftBic: d.swiftBic ? String(d.swiftBic).toUpperCase() : undefined,
    };
  } catch {
    console.error('[deposits] BANK_DEPOSIT_DETAILS is not valid JSON; not shown.');
    return null;
  }
}

export interface CryptoDepositConfig {
  token: 'USDC' | 'USDT';
  network: string;
  networkLabel: string;
  address: string;
  memoOrTag?: string;
  confirmationsRequired: number;
  minimumDeposit: number;
}

/**
 * Stablecoin deposit addresses. These must be wallets the bank controls, so
 * they are never hard-coded: set CRYPTO_DEPOSIT_CONFIGS to a JSON array of
 * CryptoDepositConfig. With nothing configured, no address is shown and the
 * portal directs customers to support.
 */
export async function getCryptoDepositConfigs(): Promise<CryptoDepositConfig[]> {
  const raw = process.env.CRYPTO_DEPOSIT_CONFIGS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((c) => c && typeof c.address === 'string' && c.address && (c.token === 'USDC' || c.token === 'USDT'))
      : [];
  } catch {
    console.error('[deposits] CRYPTO_DEPOSIT_CONFIGS is not valid JSON; no deposit addresses shown.');
    return [];
  }
}

export interface DepositLocation {
  id: string;
  name: string;
  type: 'BRANCH' | 'ATM';
  address: string;
  cityStateZip: string;
  hours: string;
}

/**
 * Branches that take cash deposits and prepare cash orders. Real places only,
 * so they come from DEPOSIT_LOCATIONS (a JSON array of DepositLocation).
 * With none configured, cash deposits and teller orders aren't offered.
 */
export async function getDepositLocations(): Promise<DepositLocation[]> {
  const raw = process.env.DEPOSIT_LOCATIONS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((l) => l && typeof l.id === 'string' && l.id && typeof l.name === 'string' && typeof l.address === 'string')
          .map((l) => ({
            id: l.id,
            name: l.name,
            type: l.type === 'ATM' ? 'ATM' : 'BRANCH',
            address: l.address,
            cityStateZip: typeof l.cityStateZip === 'string' ? l.cityStateZip : '',
            hours: typeof l.hours === 'string' ? l.hours : '',
          }))
      : [];
  } catch {
    console.error('[deposits] DEPOSIT_LOCATIONS is not valid JSON; no branches shown.');
    return [];
  }
}

/**
 * Withdrawal requests staff fulfil. Cardless ATM paycodes and agency vouchers
 * were removed: no ATM or agent network can redeem them.
 */
export type WithdrawalMethod = 'linked_ach' | 'pre_staged_counter' | 'cashiers_check';

export interface WithdrawalSubmissionData {
  accountId: string;
  method: WithdrawalMethod;
  amount: number;
  /** The customer's transaction PIN; checked, never stored. */
  pin: string;
  recipientName?: string;
  targetBankDetails?: {
    bankName?: string;
    routingNumber?: string;
    accountNumber?: string;
    accountType?: string;
  };
  locationId?: string;
  deliveryAddress?: string;
  denominations?: string;
  notes?: string;
}

export interface WithdrawalResult {
  success: boolean;
  reference?: string;
  id?: string;
  amount?: number;
  error?: string;
  field?: 'pin';
}

const WITHDRAWAL_LABELS: Record<WithdrawalMethod, string> = {
  linked_ach: 'Transfer to your account at another bank',
  pre_staged_counter: 'Cash order for branch collection',
  cashiers_check: "Cashier's cheque by courier",
};

export async function submitWithdrawal(data: WithdrawalSubmissionData): Promise<WithdrawalResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const { accountId, method, amount, pin, recipientName, targetBankDetails, locationId, deliveryAddress, denominations, notes } = data;

  const label = WITHDRAWAL_LABELS[method];
  if (!label) return { success: false, error: 'This withdrawal method is not available.' };

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: 'Enter an amount greater than zero.' };
  }

  const account = await ownActiveAccount(userId, accountId);
  if (!account) return { success: false, error: 'Choose one of your active accounts.' };
  if (account.balance < amount) {
    return { success: false, error: 'The amount is more than the available balance of this account.' };
  }

  const metadata: Record<string, unknown> = { method, notes: notes?.trim() || undefined };
  let description = label;

  if (method === 'linked_ach') {
    const bankName = targetBankDetails?.bankName?.trim();
    const routing = targetBankDetails?.routingNumber?.replace(/\D/g, '') ?? '';
    const number = targetBankDetails?.accountNumber?.replace(/\D/g, '') ?? '';
    if (!bankName) return { success: false, error: 'Enter the name of the other bank.' };
    if (!isValidRouting(routing)) return { success: false, error: 'Enter a valid 9-digit routing number.' };
    if (!/^\d{4,17}$/.test(number)) return { success: false, error: 'Enter an account number of 4 to 17 digits.' };
    const accountType = targetBankDetails?.accountType === 'SAVINGS' ? 'SAVINGS' : 'CHECKING';
    metadata.targetBankDetails = { bankName, routingNumber: routing, accountNumber: number, accountType };
    description = `${label} · ${bankName} ••••${number.slice(-4)}`;
  } else if (method === 'pre_staged_counter') {
    if (amount < TELLER_ORDER_MINIMUM) {
      return { success: false, error: `Branch cash orders start at $${TELLER_ORDER_MINIMUM}.` };
    }
    const location = (await getDepositLocations()).find((l) => l.id === locationId && l.type === 'BRANCH');
    if (!location) return { success: false, error: 'Choose a branch from the list.' };
    metadata.location = { id: location.id, name: location.name, address: `${location.address}, ${location.cityStateZip}` };
    metadata.denominations = denominations?.trim() || undefined;
    description = `${label} · ${location.name}`;
  } else {
    const payee = recipientName?.trim();
    const address = deliveryAddress?.trim();
    if (!payee) return { success: false, error: 'Enter who the cheque should be made out to.' };
    if (!address || address.length < 10) return { success: false, error: 'Enter the full delivery address.' };
    metadata.recipientName = payee;
    metadata.deliveryAddress = address;
    description = `${label} · payable to ${payee}`;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { transactionPin: true } });
  if (!user?.transactionPin) {
    return { success: false, error: 'Set up a transaction PIN in Settings before making a withdrawal.', field: 'pin' };
  }
  if (!(await bcrypt.compare(pin || '', user.transactionPin))) {
    return { success: false, error: "That PIN isn't right. Try again.", field: 'pin' };
  }

  // The request waits for staff. The account is debited only when they
  // approve it (approveWithdrawal), after the balance is checked again.
  const reference = newReference('WTH');
  const tx = await prisma.transaction.create({
    data: {
      accountId,
      type: 'DEBIT',
      transactionType: 'WITHDRAWAL',
      amount,
      currency: account.currency,
      status: 'PENDING',
      description,
      reference,
      methodId: method,
      category: 'CASH_WITHDRAWAL',
      channel: 'PORTAL',
      metadata: JSON.stringify(metadata),
    },
  });

  revalidatePath('/deposit');
  revalidatePath('/dashboard');
  revalidatePath('/activities');
  revalidatePath('/admin/ebank/deposits');

  return { success: true, reference, id: tx.id, amount };
}
