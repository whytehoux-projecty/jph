import { randomBytes, randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';

// No look-alike characters (0/O, 1/l/I) so the code can be typed from an email.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$*!';

/** A 14-character temporary password from a cryptographically secure source. */
export function generateTemporaryPassword(length = 14): string {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/**
 * A bcrypt hash of 32 random bytes that is never stored or shown anywhere.
 * Used for profiles that exist before online access is granted: nobody,
 * including staff, can sign in with it. Real credentials are issued when
 * online access is approved.
 */
export async function unusablePasswordHash(): Promise<string> {
  return bcrypt.hash(randomBytes(32).toString('base64url'), 12);
}
