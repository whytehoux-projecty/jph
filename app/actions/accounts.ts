'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import {
  VaultType,
  VAULT_TYPES,
  normalizeVaultType,
  validateVaultEligibility,
  determinePrimaryStatus,
} from '@/lib/vault-rules';

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { isPrimary: 'desc' },
      { createdAt: 'asc' }
    ],
  });

  return accounts;
}

export async function getCryptoWallets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const wallets = await prisma.cryptoWallet.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });

  return wallets;
}

export async function getAccountById(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      transactions: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!account || account.userId !== session.user.id) {
    throw new Error('Account not found');
  }

  return account;
}

export async function getAccountTransactions(accountId: string, limit: number = 50) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account || account.userId !== session.user.id) {
    throw new Error('Account not found');
  }

  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  return transactions;
}

/**
 * Returns the current vault inventory and eligibility map for all 5 vault types.
 */
export async function getVaultEligibilityMap() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const existingAccounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { id: true, accountType: true, isPrimary: true, isExternal: true, accountNumber: true, institutionName: true }
  });

  const existingTypes = existingAccounts.map(a => a.accountType);
  const normalizedHeld = existingTypes.map(normalizeVaultType);

  const eligibility: Record<VaultType, { held: boolean; canOpen: boolean; canLink: boolean; reason?: string }> = {
    SAVINGS: { held: false, canOpen: true, canLink: true },
    CURRENT: { held: false, canOpen: true, canLink: true },
    DCA: { held: false, canOpen: true, canLink: true },
    INVESTMENT: { held: false, canOpen: true, canLink: true },
    OFFSHORE: { held: false, canOpen: true, canLink: true },
  };

  (Object.keys(VAULT_TYPES) as VaultType[]).forEach((type) => {
    const isHeld = normalizedHeld.includes(type);
    eligibility[type].held = isHeld;
    if (isHeld) {
      eligibility[type].canOpen = false;
      eligibility[type].canLink = false;
      eligibility[type].reason = `You already have an active ${VAULT_TYPES[type].label}. Remove or replace it to open or link another.`;
    }
  });

  // Fetch any pending swap requests for this user
  let pendingSwapRequests: any[] = [];
  try {
    pendingSwapRequests = await prisma.accountSwapRequest.findMany({
      where: { userId: session.user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });
  } catch (err) {
    console.warn('Could not query account_swap_requests:', err);
  }

  return {
    accounts: existingAccounts,
    heldTypes: normalizedHeld,
    eligibility,
    pendingSwapRequests,
  };
}

export interface OpenNewVaultInput {
  vaultType: VaultType;
  currency?: string;
  initialDeposit?: number;
  fundingAccountId?: string;
  notes?: string;
}

/**
 * Server action to open a new internal Heritage Trust Vault.
 * Strictly enforces single source of truth rules.
 */
export async function openNewVault(input: OpenNewVaultInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;
  const normalizedType = normalizeVaultType(input.vaultType);
  const typeDef = VAULT_TYPES[normalizedType];

  if (!typeDef) {
    throw new Error('Invalid vault type specified.');
  }

  // 1. Fetch user's existing accounts
  const existingAccounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, accountType: true, isPrimary: true, balance: true }
  });

  // 2. Enforce one account per type rule
  const validation = validateVaultEligibility(
    existingAccounts.map(a => a.accountType),
    normalizedType,
    false
  );

  if (!validation.allowed) {
    throw new Error(validation.reason || `You already have a ${typeDef.label}. Remove or replace it to link or open another.`);
  }

  // 3. Determine Primary vs Secondary status
  const isPrimary = determinePrimaryStatus(existingAccounts.length, normalizedType);

  // 4. Generate unique 10-digit account number
  const prefix = normalizedType === 'CURRENT' ? '10' : normalizedType === 'SAVINGS' ? '20' : normalizedType === 'DCA' ? '88' : normalizedType === 'INVESTMENT' ? '55' : '77';
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  const accountNumber = `${prefix}${randomSuffix}`.slice(0, 10);

  const currency = input.currency || typeDef.defaultCurrency;
  const initialDeposit = Math.max(0, Number(input.initialDeposit) || 0);

  // If funding from another account, verify balance
  if (initialDeposit > 0 && input.fundingAccountId) {
    const fundingAcc = existingAccounts.find(a => a.id === input.fundingAccountId);
    if (!fundingAcc) throw new Error('Selected funding account was not found.');
    if (fundingAcc.balance < initialDeposit) {
      throw new Error(`Insufficient funds in source account (Available: $${fundingAcc.balance.toFixed(2)}).`);
    }
  }

  // 5. Create the new account
  const newAccount = await prisma.$transaction(async (tx) => {
    // If user has no existing accounts and this can be primary, make sure all others are false
    if (isPrimary) {
      await tx.account.updateMany({
        where: { userId },
        data: { isPrimary: false }
      });
    }

    const created = await tx.account.create({
      data: {
        userId,
        accountNumber,
        accountType: normalizedType,
        currency,
        balance: initialDeposit,
        status: 'ACTIVE',
        isPrimary,
        isExternal: false,
        institutionName: 'Heritage Trust Digital Bank',
        metadata: JSON.stringify({
          category: typeDef.category,
          tier: 'Institutional Digital Vault',
          notes: input.notes || 'Opened via Heritage Trust e-Banking portal',
          openedAt: new Date().toISOString()
        })
      }
    });

    // Handle funding deduction if specified
    if (initialDeposit > 0 && input.fundingAccountId) {
      await tx.account.update({
        where: { id: input.fundingAccountId },
        data: { balance: { decrement: initialDeposit } }
      });

      const refFunding = `FUND-${Date.now().toString(36).toUpperCase()}`;
      await tx.transaction.create({
        data: {
          accountId: input.fundingAccountId,
          type: 'DEBIT',
          transactionType: 'LOCAL_TRANSFER',
          amount: initialDeposit,
          currency,
          status: 'APPROVED',
          description: `Initial funding transfer to new ${typeDef.label} (••••${accountNumber.slice(-4)})`,
          reference: refFunding,
          processedAt: new Date(),
        }
      });

      const refCredit = `INIT-${Date.now().toString(36).toUpperCase()}`;
      await tx.transaction.create({
        data: {
          accountId: created.id,
          type: 'CREDIT',
          transactionType: 'LOCAL_TRANSFER',
          amount: initialDeposit,
          currency,
          status: 'APPROVED',
          description: `Initial opening deposit from ••••${input.fundingAccountId.slice(-4)}`,
          reference: refCredit,
          processedAt: new Date(),
        }
      });
    }

    // If DCA vault, provision corresponding CryptoWallet record if not already existing
    if (normalizedType === 'DCA') {
      const existingWallet = await tx.cryptoWallet.findFirst({
        where: { userId, currency: 'USDC' }
      });
      if (!existingWallet) {
        const dummyAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        await tx.cryptoWallet.create({
          data: {
            userId,
            currency: 'USDC',
            balance: initialDeposit,
            address: dummyAddress,
            status: 'ACTIVE'
          }
        });
      }
    }

    return created;
  });

  revalidatePath('/vaults');
  revalidatePath('/dashboard');
  revalidatePath('/transfer');

  return {
    success: true,
    account: newAccount,
    message: `${typeDef.label} has been provisioned successfully.`
  };
}

export interface LinkExternalVaultInput {
  vaultType: VaultType;
  institutionName: string;
  accountNumber: string;
  routingOrSwift: string;
  accountHolderName: string;
  currency?: string;
}

/**
 * Server action to link an external bank account as a Secondary Vault.
 * Strictly enforces single source of truth rules.
 */
export async function linkExternalVault(input: LinkExternalVaultInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;
  const normalizedType = normalizeVaultType(input.vaultType);
  const typeDef = VAULT_TYPES[normalizedType];

  if (!typeDef) {
    throw new Error('Invalid vault type specified.');
  }

  if (!input.institutionName?.trim()) {
    throw new Error('Financial institution name is required.');
  }
  if (!input.accountNumber?.trim()) {
    throw new Error('Account number is required.');
  }
  if (!input.routingOrSwift?.trim()) {
    throw new Error('Routing number or SWIFT/BIC is required.');
  }

  // 1. Fetch user's existing accounts
  const existingAccounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, accountType: true, isPrimary: true }
  });

  // 2. Enforce one account per type rule (counts internal + external)
  const validation = validateVaultEligibility(
    existingAccounts.map(a => a.accountType),
    normalizedType,
    true
  );

  if (!validation.allowed) {
    throw new Error(validation.reason || `You already have an active ${typeDef.label}. Remove or replace it to link another.`);
  }

  // 3. Linked external accounts are ALWAYS Secondary
  const isPrimary = false;

  const cleanAccNum = input.accountNumber.trim();
  const maskedAccNum = `EXT-${cleanAccNum.slice(-4).padStart(cleanAccNum.length > 4 ? cleanAccNum.length : 8, '•')}`;

  const linkedAccount = await prisma.account.create({
    data: {
      userId,
      accountNumber: `EXT-${Date.now().toString(36).toUpperCase()}-${cleanAccNum.slice(-4)}`,
      accountType: normalizedType,
      currency: input.currency || 'USD',
      balance: 0.00,
      status: 'ACTIVE',
      isPrimary,
      isExternal: true,
      institutionName: input.institutionName.trim(),
      metadata: JSON.stringify({
        isExternal: true,
        institutionName: input.institutionName.trim(),
        routingOrSwift: input.routingOrSwift.trim(),
        accountHolderName: input.accountHolderName.trim() || session.user.name,
        maskedNumber: maskedAccNum,
        linkedAt: new Date().toISOString()
      })
    }
  });

  revalidatePath('/vaults');
  revalidatePath('/dashboard');
  revalidatePath('/transfer');

  return {
    success: true,
    account: linkedAccount,
    message: `External ${typeDef.label} at ${input.institutionName} linked successfully.`
  };
}

/**
 * Server action for a user to request Primary designation for an existing Savings or Current vault.
 * Sub-accounts (DCA, Investment, Offshore) are strictly rejected.
 */
export async function requestPrimaryVaultChange(accountId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;
  const account = await prisma.account.findUnique({ where: { id: accountId } });

  if (!account || account.userId !== userId) {
    throw new Error('Account not found.');
  }

  const normalizedType = normalizeVaultType(account.accountType);
  const typeDef = VAULT_TYPES[normalizedType];

  if (!typeDef.canBePrimary) {
    throw new Error(`Sub-accounts (${typeDef.label}) are strictly Secondary and cannot be designated as Primary.`);
  }

  if (account.isPrimary) {
    throw new Error('This account is already designated as your Primary vault.');
  }

  // Create an administrative support ticket / request record
  await prisma.supportTicket.create({
    data: {
      userId,
      subject: `Primary Vault Reassignment Request — ${account.accountType} (••••${account.accountNumber.slice(-4)})`,
      message: `User requested to reassign Primary designation to ${account.accountType} account #${account.accountNumber}. Reason: ${reason || 'Customer preference'}.`,
      status: 'OPEN'
    }
  });

  // Also create a user notification confirming request receipt
  await prisma.notification.create({
    data: {
      userId,
      title: 'Primary Vault Request Submitted',
      message: `Your request to designate ${typeDef.label} (••••${account.accountNumber.slice(-4)}) as Primary has been submitted for administrative verification.`,
      isRead: false
    }
  });

  revalidatePath('/vaults');
  return {
    success: true,
    message: 'Your request for Primary vault designation has been submitted for administrative review.'
  };
}

export interface RequestAccountSwapInput {
  existingAccountId: string;
  targetAccountType: VaultType;
  institutionName: string;
  accountNumber: string;
  routingOrSwift: string;
  reason?: string;
}

/**
 * Server action to request replacing/swapping an existing held vault with a new account.
 * Goes through admin approval so the one-per-type rule is never broken mid-change.
 */
export async function requestAccountSwap(input: RequestAccountSwapInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;
  const existing = await prisma.account.findUnique({
    where: { id: input.existingAccountId }
  });

  if (!existing || existing.userId !== userId) {
    throw new Error('Existing account not found.');
  }

  const normalizedType = normalizeVaultType(input.targetAccountType);
  const typeDef = VAULT_TYPES[normalizedType];

  const swapRequest = await prisma.accountSwapRequest.create({
    data: {
      userId,
      existingAccountId: input.existingAccountId,
      targetAccountType: normalizedType,
      institutionName: input.institutionName,
      accountNumber: input.accountNumber,
      routingOrSwift: input.routingOrSwift,
      reason: input.reason || `Replace existing ${existing.accountType} vault`,
      status: 'PENDING'
    }
  });

  // Admin support ticket / notification
  await prisma.supportTicket.create({
    data: {
      userId,
      subject: `Account Swap Approval Request — ${typeDef.label}`,
      message: `Customer requested swapping existing vault ${existing.accountNumber} with new ${input.institutionName} account. Request ID: ${swapRequest.id}.`,
      status: 'OPEN'
    }
  });

  await prisma.notification.create({
    data: {
      userId,
      title: 'Vault Replacement Request Received',
      message: `Your request to replace your ${typeDef.label} has been recorded under reference #${swapRequest.id.slice(-6).toUpperCase()} and is awaiting administrative approval.`,
      isRead: false
    }
  });

  revalidatePath('/vaults');
  return {
    success: true,
    requestId: swapRequest.id,
    message: `Account swap request submitted. An administrator will review and verify before finalizing the replacement.`
  };
}
