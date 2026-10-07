/**
 * Validators and input masks for the config-driven transfer forms.
 * Every validator returns an error string, or null when the value is valid.
 */

export type ValidatorName =
  | "routing"
  | "account"
  | "iban"
  | "bic"
  | "wallet"
  | "emailOrPhone"
  | "cashtag"
  | "venmo"
  | "amount"
  | "futureDate"
  | "name";

export type Values = Record<string, string>;

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** ABA routing number: 9 digits, checksum 3-7-1 weights. */
export function isValidRouting(v: string): boolean {
  if (!/^\d{9}$/.test(v)) return false;
  const d = v.split("").map(Number);
  const sum =
    3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

/** IBAN mod-97 check. */
export function isValidIban(raw: string): boolean {
  const v = raw.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v)) return false;
  const rearranged = v.slice(4) + v.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const n = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    for (const digit of n) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export const isValidBic = (v: string) =>
  /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v.toUpperCase());

/** Wallet format per network. */
export const WALLET_FORMATS: Record<string, { test: RegExp; hint: string }> = {
  erc20: { test: /^0x[a-fA-F0-9]{40}$/, hint: "an Ethereum address starting with 0x (42 characters)" },
  polygon: { test: /^0x[a-fA-F0-9]{40}$/, hint: "a Polygon address starting with 0x (42 characters)" },
  base: { test: /^0x[a-fA-F0-9]{40}$/, hint: "a Base address starting with 0x (42 characters)" },
  trc20: { test: /^T[1-9A-HJ-NP-Za-km-z]{33}$/, hint: "a Tron address starting with T (34 characters)" },
  solana: { test: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, hint: "a Solana address (32 to 44 characters)" },
};

export function validateValue(
  name: ValidatorName,
  value: string,
  ctx: { values: Values; max?: number; balance?: number },
): string | null {
  const v = value.trim();
  switch (name) {
    case "routing":
      if (!/^\d{9}$/.test(v)) return "Routing number must be 9 digits.";
      if (!isValidRouting(v)) return "This routing number is not valid. Check the digits.";
      return null;
    case "account":
      if (!/^\d{4,17}$/.test(v)) return "Account number must be 4 to 17 digits.";
      return null;
    case "iban":
      return isValidIban(v) ? null : "Enter a valid IBAN (letters and digits, e.g. GB82 WEST 1234 5698 7654 32).";
    case "bic":
      return isValidBic(v) ? null : "SWIFT/BIC must be 8 or 11 characters (e.g. DEUTDEFF).";
    case "wallet": {
      const fmt = WALLET_FORMATS[ctx.values.network];
      if (!fmt) return "Select a network first.";
      return fmt.test.test(v) ? null : `Address does not match the selected network. Expected ${fmt.hint}.`;
    }
    case "emailOrPhone": {
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      const phone = onlyDigits(v).length === 10 || (onlyDigits(v).length === 11 && onlyDigits(v).startsWith("1"));
      return email || phone ? null : "Enter a valid email address or a 10-digit US mobile number.";
    }
    case "cashtag":
      return /^\$[A-Za-z][A-Za-z0-9_]{1,19}$/.test(v) ? null : "A $Cashtag starts with $ followed by 2 to 20 letters, digits or underscores.";
    case "venmo":
      return /^@[A-Za-z0-9_-]{5,30}$/.test(v) ? null : "A Venmo username starts with @ and has 5 to 30 letters, digits, - or _.";
    case "amount": {
      const n = parseFloat(v);
      if (!v || isNaN(n) || n <= 0) return "Enter an amount greater than zero.";
      if (ctx.max && n > ctx.max) return `Amount exceeds the per-transfer limit of ${fmtMoney(ctx.max)}.`;
      if (ctx.balance !== undefined && n > ctx.balance) return "Amount exceeds the available balance of the selected account.";
      return null;
    }
    case "futureDate": {
      if (!v) return "Choose a date.";
      const today = new Date().toISOString().slice(0, 10);
      return v >= today ? null : "Choose today or a later date.";
    }
    case "name":
      return v.length >= 2 && /[A-Za-z]/.test(v) ? null : "Enter the full name.";
    default:
      return null;
  }
}

export const fmtMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

/** Input masks: store a clean value, show a formatted one. */
export type MaskName = "digits9" | "digits17" | "amount" | "iban" | "upper" | "none";

export function applyMask(mask: MaskName | undefined, raw: string): string {
  switch (mask) {
    case "digits9":
      return onlyDigits(raw).slice(0, 9);
    case "digits17":
      return onlyDigits(raw).slice(0, 17);
    case "amount": {
      const cleaned = raw.replace(/[^\d.]/g, "");
      const [int = "", ...rest] = cleaned.split(".");
      const dec = rest.join("").slice(0, 2);
      const intPart = int.replace(/^0+(?=\d)/, "").slice(0, 12);
      return cleaned.includes(".") ? `${intPart}.${dec}` : intPart;
    }
    case "iban":
      return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 34);
    case "upper":
      return raw.toUpperCase();
    default:
      return raw;
  }
}

export function displayMask(mask: MaskName | undefined, stored: string): string {
  switch (mask) {
    case "amount": {
      if (!stored) return "";
      const [int, dec] = stored.split(".");
      const grouped = (int || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return dec !== undefined ? `${grouped}.${dec}` : grouped;
    }
    case "iban":
      return stored.replace(/(.{4})/g, "$1 ").trim();
    default:
      return stored;
  }
}

/** Mask all but the last 4 characters. */
export const maskTail = (v: string, keep = 4) =>
  v.length <= keep ? v : "•".repeat(Math.min(v.length - keep, 8)) + v.slice(-keep);
