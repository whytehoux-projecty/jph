export interface RandomGeneratorConfig {
  accountId: string;
  count: number;
  startDate: string;
  endDate: string;
  minAmount: number;
  maxAmount: number;
  typeMix: { credit: number; debit: number }; // percentages
  seed?: number;
}

export interface TargetedGeneratorConfig {
  accountId: string;
  targetBalance: number;
  targetCount: number;
  startDate: string;
  endDate: string;
  seed?: number;
}

export interface GeneratedTransaction {
  accountId: string;
  type: string;
  transactionType: string;
  amount: number;
  status: string;
  description: string;
  reference: string;
  createdAt: Date;
  category?: string;
  channel?: string;
  isAdminEntry: boolean;
  notes?: string; // JSON
}

const CATEGORIES = ["Groceries", "Dining", "Entertainment", "Transport", "Utilities", "Salary", "Shopping", "Health"];
const MERCHANTS_DEBIT = ["Amazon", "Uber", "Starbucks", "Whole Foods", "Netflix", "Spotify", "Delta Airlines", "Shell"];
const MERCHANTS_CREDIT = ["Acme Corp Payroll", "Venmo Cashout", "IRS Refund", "Wire Transfer In"];

// A simple deterministic PRNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRandom(config: RandomGeneratorConfig): GeneratedTransaction[] {
  const rng = mulberry32(config.seed ?? Date.now());
  const transactions: GeneratedTransaction[] = [];
  
  const startTs = new Date(config.startDate).getTime();
  const endTs = new Date(config.endDate).getTime();

  for (let i = 0; i < config.count; i++) {
    const isCredit = rng() * 100 < config.typeMix.credit;
    const amount = Math.floor((rng() * (config.maxAmount - config.minAmount) + config.minAmount) * 100) / 100;
    const ts = startTs + rng() * (endTs - startTs);
    const date = new Date(ts);

    const merchants = isCredit ? MERCHANTS_CREDIT : MERCHANTS_DEBIT;
    const merchant = merchants[Math.floor(rng() * merchants.length)];
    const category = isCredit ? "Income" : CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
    const channel = isCredit ? "wire" : "card";

    transactions.push({
      accountId: config.accountId,
      type: isCredit ? "CREDIT" : "DEBIT",
      transactionType: isCredit ? "LOCAL_TRANSFER" : "CARD_PAYMENT",
      amount,
      status: "COMPLETED",
      description: merchant,
      reference: `GEN-${(rng() * 36**6).toString(36).substring(0, 6).toUpperCase()}`,
      createdAt: date,
      category,
      channel,
      isAdminEntry: true,
      notes: JSON.stringify([{ text: "Generated randomly by Admin", authorName: "Admin", createdAt: new Date() }])
    });
  }

  // Sort by date
  transactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return transactions;
}

export function generateTargeted(config: TargetedGeneratorConfig): { ok: true; transactions: GeneratedTransaction[] } | { ok: false; error: string } {
  // Simplistic targeted generation for demo purposes:
  // Distributes the targetBalance across targetCount transactions.
  const rng = mulberry32(config.seed ?? Date.now());
  const transactions: GeneratedTransaction[] = [];
  
  const startTs = new Date(config.startDate).getTime();
  const endTs = new Date(config.endDate).getTime();

  // If we need target balance, let's just make the sum equal to it.
  // We'll generate random amounts and then scale them.
  let rawSum = 0;
  const amounts = [];
  for (let i = 0; i < config.targetCount; i++) {
    const a = rng() * 1000 - 300; // skew towards positive or whatever
    amounts.push(a);
    rawSum += a;
  }
  
  if (rawSum === 0) return { ok: false, error: "Mathematical inconsistency in generator" };
  
  const scale = config.targetBalance / rawSum;

  for (let i = 0; i < config.targetCount; i++) {
    let finalAmount = Math.floor(amounts[i] * scale * 100) / 100;
    if (i === config.targetCount - 1) {
      // Fix rounding error on last item
      const currentSum = transactions.reduce((sum, t) => sum + (t.type === 'CREDIT' ? t.amount : -t.amount), 0);
      finalAmount = config.targetBalance - currentSum;
    }
    
    const isCredit = finalAmount > 0;
    const amount = Math.abs(finalAmount);
    
    const ts = startTs + rng() * (endTs - startTs);
    const date = new Date(ts);

    const merchants = isCredit ? MERCHANTS_CREDIT : MERCHANTS_DEBIT;
    const merchant = merchants[Math.floor(rng() * merchants.length)];
    const category = isCredit ? "Income" : CATEGORIES[Math.floor(rng() * CATEGORIES.length)];

    transactions.push({
      accountId: config.accountId,
      type: isCredit ? "CREDIT" : "DEBIT",
      transactionType: isCredit ? "LOCAL_TRANSFER" : "CARD_PAYMENT",
      amount,
      status: "COMPLETED",
      description: merchant,
      reference: `TGT-${(rng() * 36**6).toString(36).substring(0, 6).toUpperCase()}`,
      createdAt: date,
      category,
      channel: isCredit ? "wire" : "card",
      isAdminEntry: true,
      notes: JSON.stringify([{ text: "Generated targeted by Admin", authorName: "Admin", createdAt: new Date() }])
    });
  }

  transactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return { ok: true, transactions };
}
