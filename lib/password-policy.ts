/**
 * Rules for a customer's permanent password, checked in the browser (as a
 * checklist) and again on the server. The PIN rule is shared the same way.
 */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'An uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'A lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { id: 'number', label: 'A number', test: (v: string) => /\d/.test(v) },
  { id: 'special', label: 'A symbol, such as ! or #', test: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
] as const;

/** How long a temporary password works before staff must issue a new one. */
export const TEMP_PASSWORD_TTL_HOURS = 72;

export const meetsPasswordPolicy = (v: string) => v.length <= 128 && PASSWORD_RULES.every((r) => r.test(v));

/** 4 to 6 digits, and not all the same digit or a straight run (1234, 9876). */
export function pinProblem(pin: string): string | null {
  if (!/^\d{4,6}$/.test(pin)) return 'Use 4 to 6 digits.';
  if (/^(\d)\1+$/.test(pin)) return "Don't use the same digit throughout.";
  const digits = pin.split('').map(Number);
  const step = digits[1] - digits[0];
  if ((step === 1 || step === -1) && digits.every((d, i) => i === 0 || d - digits[i - 1] === step)) {
    return "Don't use a run of digits like 1234.";
  }
  return null;
}
