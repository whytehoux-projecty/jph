'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type DepositMethodsOverrides } from '@/lib/feature-overrides';

export interface DepositSubmissionData {
  accountId: string;
  method: 'cash' | 'virtual' | 'check' | 'card' | 'crypto';
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
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

export async function submitDeposit(data: DepositSubmissionData): Promise<DepositResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { accountId, method, amount, currency = 'USD', description, metadata = {} } = data;

  // Check customer-level deposit permissions set by Admin
  const permissions = await getUserDepositPermissions();
  if (!permissions.enabled) {
    return {
      success: false,
      error: 'Deposit services are currently disabled for your account. Please consult with your private relationship manager.',
    };
  }

  if (permissions.methods[method] === false) {
    const formattedMethod = method.charAt(0).toUpperCase() + method.slice(1);
    return {
      success: false,
      error: `${formattedMethod} deposit services are currently disabled for your account profile.`,
    };
  }

  if (!amount || amount <= 0) {
    return { success: false, error: 'Please enter a valid deposit amount greater than zero.' };
  }

  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account || account.userId !== session.user.id) {
    return { success: false, error: 'Unauthorized account access.' };
  }


  const methodLabels: Record<string, { type: string; label: string }> = {
    cash: { type: 'CASH_DEPOSIT', label: 'Direct Cash Deposit' },
    virtual: { type: 'VIRTUAL_DEPOSIT', label: 'Third-Party / Virtual ACH Deposit' },
    check: { type: 'CHECK_DEPOSIT', label: 'Mobile Check Deposit' },
    card: { type: 'CARD_DEPOSIT', label: 'Debit/Credit Card Top-Up' },
    crypto: { type: 'CRYPTO_DEPOSIT', label: 'USDC/USDT Stablecoin Deposit' },
  };

  const methodInfo = methodLabels[method] || { type: 'DEPOSIT', label: 'Account Deposit' };
  const ref = 'DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const tx = await prisma.transaction.create({
    data: {
      accountId,
      type: 'CREDIT',
      transactionType: methodInfo.type,
      amount: Number(amount),
      currency,
      status: 'PENDING',
      description: description || `${methodInfo.label} to ${account.accountType}`,
      reference: ref,
      methodId: method,
      category: 'DEPOSIT',
      channel: 'PORTAL_DEPOSIT',
      metadata: JSON.stringify({
        ...metadata,
        depositMethod: method,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/deposit');
  revalidatePath('/dashboard');
  revalidatePath('/activities');
  revalidatePath('/vaults');

  return { success: true, reference: tx.reference, id: tx.id };
}

export async function getRecentDeposits(limit = 6) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { id: true, accountType: true, accountNumber: true },
  });

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const accountIds = accounts.map((a) => a.id);

  const txs = await prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      type: 'CREDIT',
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return txs.map((t) => ({
    id: t.id,
    reference: t.reference,
    amount: t.amount,
    currency: t.currency,
    status: t.status,
    description: t.description,
    methodId: t.methodId,
    createdAt: t.createdAt.toISOString(),
    accountType: accountMap.get(t.accountId)?.accountType || 'CHECKING',
    accountNumber: accountMap.get(t.accountId)?.accountNumber || '1234',
  }));
}

export interface BankRoutingDetails {
  bankName: string;
  achRouting: string;
  wireRouting: string;
  swiftBic: string;
  bankAddress: string;
  fdicInsured: boolean;
}

export async function getBankRoutingDetails(): Promise<BankRoutingDetails> {
  return {
    bankName: 'Heritage Trust Bank N.A.',
    achRouting: '021000089',
    wireRouting: '021000089',
    swiftBic: 'HTBKUS33XXX',
    bankAddress: '48 Wall Street, New York, NY 10005, United States',
    fdicInsured: true,
  };
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

export async function getCryptoDepositConfigs(): Promise<CryptoDepositConfig[]> {
  return [
    {
      token: 'USDC',
      network: 'ERC20',
      networkLabel: 'Ethereum (ERC-20)',
      address: '0x71C8A6992E5B3c86B37b987514a38F3c3A03B426',
      confirmationsRequired: 12,
      minimumDeposit: 10,
    },
    {
      token: 'USDC',
      network: 'SOL',
      networkLabel: 'Solana (SPL)',
      address: '8X3BzpC98v4N7J7Vq4oX5d8x8dY8a7W2xK8d9X2V3L4',
      confirmationsRequired: 32,
      minimumDeposit: 5,
    },
    {
      token: 'USDC',
      network: 'POLYGON',
      networkLabel: 'Polygon PoS',
      address: '0x71C8A6992E5B3c86B37b987514a38F3c3A03B426',
      confirmationsRequired: 64,
      minimumDeposit: 5,
    },
    {
      token: 'USDT',
      network: 'TRC20',
      networkLabel: 'Tron (TRC-20)',
      address: 'TN3W4H6rK2Z5V8x3b8Y9q4N7oX5d8x8dY8',
      confirmationsRequired: 20,
      minimumDeposit: 10,
    },
    {
      token: 'USDT',
      network: 'ERC20',
      networkLabel: 'Ethereum (ERC-20)',
      address: '0x71C8A6992E5B3c86B37b987514a38F3c3A03B426',
      confirmationsRequired: 12,
      minimumDeposit: 10,
    },
    {
      token: 'USDT',
      network: 'POLYGON',
      networkLabel: 'Polygon PoS',
      address: '0x71C8A6992E5B3c86B37b987514a38F3c3A03B426',
      confirmationsRequired: 64,
      minimumDeposit: 5,
    },
  ];
}

export interface DepositLocation {
  id: string;
  name: string;
  type: 'BRANCH_VAULT' | 'SMART_ATM';
  address: string;
  cityStateZip: string;
  distance: string;
  hours: string;
  instantCredit: boolean;
}

export async function getDepositLocations(): Promise<DepositLocation[]> {
  return [
    {
      id: 'loc-1',
      name: 'Downtown Main Vault & Branch',
      type: 'BRANCH_VAULT',
      address: '48 Wall Street',
      cityStateZip: 'New York, NY 10005',
      distance: '0.4 mi',
      hours: 'Mon-Fri: 8:30 AM - 5:00 PM',
      instantCredit: true,
    },
    {
      id: 'loc-2',
      name: 'Midtown Commercial Vault',
      type: 'BRANCH_VAULT',
      address: '550 5th Avenue',
      cityStateZip: 'New York, NY 10036',
      distance: '1.2 mi',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM · Sat: 10:00 AM - 2:00 PM',
      instantCredit: true,
    },
    {
      id: 'loc-3',
      name: 'Grand Central 24/7 Smart ATM Deposit Vault',
      type: 'SMART_ATM',
      address: '89 E 42nd Street',
      cityStateZip: 'New York, NY 10017',
      distance: '1.5 mi',
      hours: '24/7 Continuous Access',
      instantCredit: true,
    },
    {
      id: 'loc-4',
      name: 'Hudson Yards Smart Teller Hub',
      type: 'SMART_ATM',
      address: '20 Hudson Yards',
      cityStateZip: 'New York, NY 10001',
      distance: '2.1 mi',
      hours: '24/7 Continuous Access',
      instantCredit: true,
    },
  ];
}
