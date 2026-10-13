export type VaultType = 'SAVINGS' | 'CURRENT' | 'DCA' | 'INVESTMENT' | 'OFFSHORE';

export interface VaultTypeDefinition {
  type: VaultType;
  label: string;
  category: 'core' | 'sub';
  canBePrimary: boolean;
  defaultCurrency: string;
  shortDesc: string;
  interestRate: string;
  liquidity: string;
  explainer: {
    purpose: string;
    interest: string;
    fees: string;
    withdrawals: string;
    typicalUse: string;
    globalContext: string;
  };
}

export const VAULT_TYPES: Record<VaultType, VaultTypeDefinition> = {
  SAVINGS: {
    type: 'SAVINGS',
    label: 'Savings Vault',
    category: 'core',
    canBePrimary: true,
    defaultCurrency: 'USD',
    shortDesc: 'Capital accumulation and emergency reserves with high-yield compound growth.',
    interestRate: '4.20% APY',
    liquidity: 'Standard Liquidity (Notice/Transfer)',
    explainer: {
      purpose:
        'Engineered for capital preservation, emergency reserves, and targeted liquidity. Balances earn daily compound interest disbursed monthly.',
      interest:
        'Accrues a competitive, variable high-yield institutional APY calculated on end-of-day ledger balance.',
      fees:
        'Zero monthly maintenance fee when minimum reserve balances are maintained. Zero account maintenance fees.',
      withdrawals:
        'High liquidity via automated internal vault transfers and outbound clearing rails. Not structured for direct POS card transactions.',
      typicalUse:
        'Emergency reserves, medium-term tax provisions, capital staging, and structured treasury yields.',
      globalContext:
        'In domestic markets, operates as a high-yield savings account insured to standard deposit limits. Internationally, functions as an interest-bearing demand deposit or notice reserve account.',
    },
  },
  CURRENT: {
    type: 'CURRENT',
    label: 'Current Vault',
    category: 'core',
    canBePrimary: true,
    defaultCurrency: 'USD',
    shortDesc: 'Primary transactional hub for day-to-day liquidity, payroll, debit cards, and bills.',
    interestRate: '0.00% APR',
    liquidity: 'Instant Liquidity (Unrestricted)',
    explainer: {
      purpose:
        'Designed for high-frequency day-to-day transactions, inbound direct payroll deposits, outbound wire settlements, ACH debits, and bill payments.',
      interest:
        'Non-interest bearing or nominal yield, structured entirely for rapid cash mobility, transaction velocity, and clearing throughput.',
      fees:
        'Transparent banking with zero transaction surcharges on domestic ACH, internal vault movements, and retail card usage.',
      withdrawals:
        'Unrestricted everyday liquidity via debit cards, point-of-sale terminals, cardless ATM paycodes, FedNow, and instant clearing.',
      typicalUse:
        'Operational cashflow, commercial vendor settlements, monthly utility disbursements, and card-linked purchasing.',
      globalContext:
        'Known in the United States as a Checking Account, and across the United Kingdom, Europe, and global commerce as a Current Account.',
    },
  },
  DCA: {
    type: 'DCA',
    label: 'Digital Currency Vault (DCA)',
    category: 'sub',
    canBePrimary: false,
    defaultCurrency: 'USD',
    shortDesc: 'Institutional custody for liquid digital dollars (USDC/USDT) and blockchain settlements.',
    interestRate: 'Variable Yield',
    liquidity: 'T+0 Instant Ledger',
    explainer: {
      purpose:
        'A dedicated digital currency vault enabling direct custody and conversion of institutional dollar-backed stablecoins (USDC and USDT) across multiple blockchain networks.',
      interest:
        'Optional stablecoin yield participation through institutional staking and treasury reserve protocols where enabled.',
      fees:
        'Network miner gas fees apply for on-chain broadcast; zero deposit fees on inbound stablecoin clearing.',
      withdrawals:
        'Instant multi-chain outbound settlements to whitelisted digital wallet addresses or one-click internal ledger conversion to USD.',
      typicalUse:
        'Cross-border digital settlement, round-the-clock liquidity, Web3 asset custody, and fiat-to-stablecoin balancing.',
      globalContext:
        'Operates as an institutional sub-account under custody segregation guidelines. Always designated as Secondary.',
    },
  },
  INVESTMENT: {
    type: 'INVESTMENT',
    label: 'Investment Vault',
    category: 'sub',
    canBePrimary: false,
    defaultCurrency: 'USD',
    shortDesc: 'Wealth management cash hub for money market allocations, treasuries, and portfolio growth.',
    interestRate: 'Market Benchmark',
    liquidity: 'T+1 Settlement',
    explainer: {
      purpose:
        'Designed to hold and sweep capital dedicated to wealth management, treasury notes, index allocations, and market asset purchases.',
      interest:
        'Yields reflect underlying institutional money market yields and capital appreciation benchmarks.',
      fees:
        'Transparent custodial management fees based on asset tiers; zero fee on internal liquidity sweeps.',
      withdrawals:
        'Standard securities settlement liquidity (typically T+1 or T+2 trade cycles) before capital can be swept back to Current.',
      typicalUse:
        'Portfolio growth, strategic reserves, fixed-income allocations, and asset-backed savings.',
      globalContext:
        'Custodial securities and cash reserve facility. Strictly designated as a Secondary vault and cannot serve as Primary.',
    },
  },
  OFFSHORE: {
    type: 'OFFSHORE',
    label: 'Offshore Vault',
    category: 'sub',
    canBePrimary: false,
    defaultCurrency: 'USD',
    shortDesc: 'Multi-currency international custody booked in premier global financial jurisdictions.',
    interestRate: 'Tiered Sovereign Yield',
    liquidity: 'Multi-Currency Global Wire',
    explainer: {
      purpose:
        'Enables customers to custody capital in premier international jurisdictions outside their primary domestic tax residence (e.g., Zurich, London, Cayman Islands).',
      interest:
        'Tiered foreign currency yields according to central bank policy rates of the underlying denominated currency.',
      fees:
        'Competitive international clearing and FX conversion rates; annual custodial administration fee based on balance.',
      withdrawals:
        'Cross-border SWIFT/BIC wires, multi-currency IBAN transfers, and international treasury distributions.',
      typicalUse:
        'Jurisdictional asset diversification, international business settlement, expat liquidity, and multi-currency holding (USD, EUR, GBP, CHF).',
      globalContext:
        'International booking center account governed by foreign regulatory frameworks. Always designated as Secondary.',
    },
  },
};

/**
 * Normalizes any legacy or variant account type string to standard VaultType.
 */
export function normalizeVaultType(raw: string): VaultType {
  const s = (raw || '').toUpperCase().trim();
  if (s.includes('SAVING')) return 'SAVINGS';
  if (s.includes('CHECKING') || s.includes('CURRENT') || s.includes('PERSONAL')) return 'CURRENT';
  if (s.includes('DCA') || s.includes('CRYPTO') || s.includes('WALLET') || s.includes('USDC') || s.includes('USDT')) return 'DCA';
  if (s.includes('INVEST') || s.includes('WEALTH') || s.includes('PORTFOLIO') || s.includes('CREDIT') || s.includes('LOAN')) return 'INVESTMENT';
  if (s.includes('OFFSHORE') || s.includes('FOREIGN') || s.includes('SWISS') || s.includes('GLOBAL')) return 'OFFSHORE';
  return 'CURRENT';
}

/**
 * Checks if a user can open or link a specific vault type.
 * Returns { allowed: boolean, reason?: string }
 */
export function validateVaultEligibility(
  existingAccountTypes: string[],
  requestedType: VaultType,
  isExternal: boolean = false
): { allowed: boolean; reason?: string } {
  const normalizedHeld = existingAccountTypes.map(normalizeVaultType);
  const def = VAULT_TYPES[requestedType];

  if (!def) {
    return { allowed: false, reason: 'Invalid vault type specified.' };
  }

  // One account per type rule:
  if (normalizedHeld.includes(requestedType)) {
    const actionDesc = isExternal ? 'link another' : 'open another';
    return {
      allowed: false,
      reason: `You already have an active ${def.label}. Remove or replace it to ${actionDesc}.`,
    };
  }

  return { allowed: true };
}

/**
 * Determines whether the new account should be Primary.
 * Rule: First account opened by user (at registration or initial setup) is Primary if Savings or Current.
 * Subsequent accounts or any sub-account (DCA, Investment, Offshore) are strictly Secondary.
 */
export function determinePrimaryStatus(
  existingAccountsCount: number,
  requestedType: VaultType
): boolean {
  const def = VAULT_TYPES[requestedType];
  if (!def.canBePrimary) return false;
  return existingAccountsCount === 0;
}
