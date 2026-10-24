/**
 * Display formatting for money and account identifiers.
 * Presentation only — never use these to build values sent to the server.
 */

/** Characters shown in place of a hidden value. */
export const MASK = "••••";

/**
 * Masks an account or card number, keeping only the last `visible` digits.
 * "0123456789" → "•••• 6789". Separators in the input are ignored.
 */
export function maskAccountNumber(value: string | null | undefined, visible = 4): string {
  if (!value) return MASK;
  const digits = value.replace(/[^0-9A-Za-z]/g, "");
  if (digits.length <= visible) return `${MASK} ${digits}`;
  return `${MASK} ${digits.slice(-visible)}`;
}

/** Groups an identifier in blocks of four for readability: "0123 4567 89". */
export function groupAccountNumber(value: string): string {
  return value.replace(/[^0-9A-Za-z]/g, "").replace(/(.{4})(?=.)/g, "$1 ");
}

export interface FormatAmountOptions {
  currency?: string;
  locale?: string;
  signDisplay?: "auto" | "always" | "never" | "exceptZero";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/** Locale-aware currency formatting. Returns null for non-numeric input. */
export function formatAmount(
  amount: number | string | null | undefined,
  {
    currency = "USD",
    locale = "en-US",
    signDisplay = "auto",
    minimumFractionDigits,
    maximumFractionDigits,
  }: FormatAmountOptions = {},
): string | null {
  if (amount === null || amount === undefined || amount === "") return null;
  const n = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(n)) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      signDisplay,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(n);
  } catch {
    // Not an ISO 4217 code (e.g. the stablecoins USDC / USDT): format the
    // number and append the code, so it is never mistaken for dollars.
    const number = new Intl.NumberFormat(locale, {
      signDisplay,
      minimumFractionDigits: minimumFractionDigits ?? 2,
      maximumFractionDigits: maximumFractionDigits ?? 2,
    }).format(n);
    return `${number} ${currency}`;
  }
}

/** Sums balances per currency — amounts in different currencies are never added together. */
export function totalsByCurrency<T extends { balance: number | string; currency?: string | null }>(
  items: T[],
  fallbackCurrency = "USD",
): Array<{ currency: string; total: number }> {
  const totals = new Map<string, number>();
  for (const item of items) {
    const code = item.currency || fallbackCurrency;
    totals.set(code, (totals.get(code) ?? 0) + Number(item.balance || 0));
  }
  return [...totals].map(([currency, total]) => ({ currency, total }));
}
