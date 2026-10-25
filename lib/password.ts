import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$.{53}$/;

export function isBcryptHash(value: string | null | undefined): value is string {
  return typeof value === 'string' && BCRYPT_HASH.test(value);
}

/**
 * Checks a password against a stored bcrypt hash.
 *
 * `legacyPlaintext` exists only for administrator rows created before
 * passwords were hashed: when the stored value is *not* a bcrypt hash, the
 * input is compared to it in constant time and, on a match, `onUpgrade`
 * receives a fresh hash to save. A stored hash is never compared as text,
 * so knowing a hash no longer lets anyone sign in.
 */
export async function verifyPassword(
  input: string,
  stored: string,
  options: { legacyPlaintext?: boolean; onUpgrade?: (hash: string) => Promise<unknown> } = {},
): Promise<boolean> {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(input, stored).catch(() => false);
  }
  if (!options.legacyPlaintext || !stored) return false;

  // Constant-time comparison of equal-length buffers (hash both sides first).
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(stored).digest();
  if (!timingSafeEqual(a, b)) return false;

  if (options.onUpgrade) await options.onUpgrade(await bcrypt.hash(input, 12));
  return true;
}
