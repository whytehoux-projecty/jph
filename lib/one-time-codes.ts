import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';

/**
 * One-time codes for signing in (SIGN_IN) and resetting a password (RESET).
 * Only keyed hashes are stored; each code has a short life, a small number of
 * tries (claimed before checking, so parallel guesses can't exceed it) and
 * can be used once. Server-side only.
 */

export const CODE_ATTEMPTS = 5;
export const SIGN_IN_CODE_MINUTES = 10;
/** A sign-in that needs no emailed code only bridges the two requests of one sign-in. */
const SIGN_IN_HANDOFF_MINUTES = 2;
export const RESET_CODE_MINUTES = 15;
export const RESET_CODES_PER_HOUR = 3;

function keyedHash(value: string) {
  const key = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!key) throw new Error('AUTH_SECRET is not set');
  return createHmac('sha256', key).update(value).digest('hex');
}

function sameHash(a: string, b: string) {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && timingSafeEqual(x, y);
}

const digits = (n: number) => Array.from({ length: n }, () => randomInt(10)).join('');

export type CodeOwner = { kind: 'customer' | 'admin'; id: string };

const ownerWhere = (o: CodeOwner) => (o.kind === 'customer' ? { userId: o.id } : { adminUserId: o.id });

/**
 * Starts a sign-in after the password matched. The browser keeps `secret`
 * for the second step; `code`, when asked for, is what to email.
 */
export async function createSignInChallenge(owner: CodeOwner, withCode: boolean) {
  await prisma.oneTimeCode.deleteMany({ where: { ...ownerWhere(owner), purpose: 'SIGN_IN', usedAt: null } });
  const secret = randomBytes(32).toString('base64url');
  const code = withCode ? digits(6) : null;
  await prisma.oneTimeCode.create({
    data: {
      ...ownerWhere(owner),
      purpose: 'SIGN_IN',
      secretHash: keyedHash(secret),
      codeHash: code ? keyedHash(code) : null,
      expiresAt: new Date(Date.now() + (withCode ? SIGN_IN_CODE_MINUTES : SIGN_IN_HANDOFF_MINUTES) * 60_000),
    },
  });
  return { secret, code };
}

export type ChallengeResult = { ok: true; owner: CodeOwner } | { ok: false; reason: 'expired' | 'wrong' | 'used-up'; triesLeft?: number };

/** Finishes a sign-in: the challenge must be live, and the code right when one was sent. */
export async function consumeSignInChallenge(secret: string, code: string | undefined): Promise<ChallengeResult> {
  if (!secret) return { ok: false, reason: 'expired' };
  const row = await prisma.oneTimeCode.findUnique({ where: { secretHash: keyedHash(secret) } });
  if (!row || row.purpose !== 'SIGN_IN' || row.usedAt || row.expiresAt < new Date()) return { ok: false, reason: 'expired' };
  return claimAndCheck(row.id, ownerOf(row), row.codeHash, code);
}

/** A reset code for a customer, or null when they've asked for too many in the last hour. */
export async function createResetCode(userId: string) {
  const recent = await prisma.oneTimeCode.count({
    where: { userId, purpose: 'RESET', createdAt: { gt: new Date(Date.now() - 3_600_000) } },
  });
  if (recent >= RESET_CODES_PER_HOUR) return null;
  await prisma.oneTimeCode.updateMany({ where: { userId, purpose: 'RESET', usedAt: null }, data: { usedAt: new Date() } });
  const code = digits(8);
  await prisma.oneTimeCode.create({
    data: { userId, purpose: 'RESET', codeHash: keyedHash(code), expiresAt: new Date(Date.now() + RESET_CODE_MINUTES * 60_000) },
  });
  return code;
}

/** Checks the customer's latest live reset code. */
export async function consumeResetCode(userId: string, code: string): Promise<ChallengeResult> {
  const row = await prisma.oneTimeCode.findFirst({
    where: { userId, purpose: 'RESET', usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!row) return { ok: false, reason: 'expired' };
  return claimAndCheck(row.id, ownerOf(row), row.codeHash, code);
}

function ownerOf(row: { userId: string | null; adminUserId: string | null }): CodeOwner {
  return row.adminUserId ? { kind: 'admin', id: row.adminUserId } : { kind: 'customer', id: row.userId! };
}

async function claimAndCheck(id: string, owner: CodeOwner, codeHash: string | null, code: string | undefined): Promise<ChallengeResult> {
  if (codeHash) {
    const claimed = await prisma.oneTimeCode.updateMany({
      where: { id, usedAt: null, attempts: { lt: CODE_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    if (claimed.count === 0) return { ok: false, reason: 'used-up' };
    if (!code || !sameHash(keyedHash(code.replace(/\s/g, '')), codeHash)) {
      const row = await prisma.oneTimeCode.findUnique({ where: { id }, select: { attempts: true } });
      const triesLeft = CODE_ATTEMPTS - (row?.attempts ?? CODE_ATTEMPTS);
      return triesLeft > 0 ? { ok: false, reason: 'wrong', triesLeft } : { ok: false, reason: 'used-up' };
    }
  }
  // Single use: only the first request to mark it wins.
  const used = await prisma.oneTimeCode.updateMany({ where: { id, usedAt: null }, data: { usedAt: new Date() } });
  if (used.count === 0) return { ok: false, reason: 'expired' };
  return { ok: true, owner };
}
