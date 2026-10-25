'use server';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { emailConfigured, sendEmail } from '@/lib/email';
import { checkPasswordWithLimit, minutesLeft } from '@/lib/sign-in-guard';
import { createSignInChallenge, SIGN_IN_CODE_MINUTES } from '@/lib/one-time-codes';
import { temporaryPasswordExpired } from '@/lib/temporary-credentials';
import { BRAND } from '@/src/content/facts';

export type BeginSignInResult =
  | { status: 'no-match' }
  | { status: 'locked'; minutes: number }
  | { status: 'paused'; message: string }
  | { status: 'temp-expired' }
  | { status: 'ready'; challenge: string }
  | { status: 'code-sent'; challenge: string; sentTo: string };

/** A real bcrypt hash of random bytes (made once), so an unknown account takes as long as a known one. */
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hash(randomBytes(16).toString('hex'), 12));

/**
 * Whether sign-in needs an emailed code. Only when it's switched on
 * (SIGN_IN_EMAIL_CODES=required) and email can actually be sent: a
 * misconfigured mailer must not lock every customer out.
 */
function codesRequired() {
  if (process.env.SIGN_IN_EMAIL_CODES !== 'required') return false;
  if (!emailConfigured()) {
    console.error('[sign-in] SIGN_IN_EMAIL_CODES=required but email is not configured; codes are not being sent.');
    return false;
  }
  return true;
}

/** j.smith@example.com → j•••h@example.com */
function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!domain) return '•••';
  return `${name.slice(0, 1)}•••${name.length > 1 ? name.slice(-1) : ''}@${domain}`;
}

/**
 * Step one of customer sign-in: checks the password (with the wrong-try
 * limit), then either hands back a short-lived challenge for step two or
 * emails a 6-digit code and waits for it. The answer for an unknown account
 * and a wrong password is the same.
 */
export async function beginSignIn(input: { userId: string; password: string }): Promise<BeginSignInResult> {
  const id = (input.userId || '').trim();
  const password = input.password || '';
  if (!id || !password) return { status: 'no-match' };

  const user = id.includes('@')
    ? await prisma.user.findFirst({ where: { email: { equals: id, mode: 'insensitive' } } })
    : await prisma.account.findUnique({ where: { accountNumber: id }, select: { user: true } }).then((a) => a?.user ?? null);

  if (!user) {
    await bcrypt.compare(password, await getDummyHash());
    return { status: 'no-match' };
  }

  const check = await checkPasswordWithLimit({ kind: 'customer', id: user.id, email: user.email, stored: user.password }, password);
  if (!check.ok) return check.lockedUntil ? { status: 'locked', minutes: minutesLeft(check.lockedUntil) } : { status: 'no-match' };

  // Everything below is only said once the password is right.
  if (!user.hasOnlineAccess || user.eportalStatus !== 'ACTIVE') {
    return { status: 'paused', message: user.eportalNotificationMessage || 'Online access for this profile is paused. Contact us for help.' };
  }
  if (temporaryPasswordExpired(user)) return { status: 'temp-expired' };

  const withCode = codesRequired();
  const { secret, code } = await createSignInChallenge({ kind: 'customer', id: user.id }, withCode);
  if (!code) return { status: 'ready', challenge: secret };

  await sendEmail({
    to: user.email,
    subject: `${BRAND.vault} sign-in code: ${code}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your sign-in code</h2>
      <p style="font-size: 24px; letter-spacing: 4px;"><strong>${code}</strong></p>
      <p>Enter it on the ${BRAND.vault} sign-in page. It works for ${SIGN_IN_CODE_MINUTES} minutes.</p>
      <p>We will never ask you for this code. If you didn't just try to sign in, someone may know your password: reset it and contact us.</p>
    </div>`,
  });
  return { status: 'code-sent', challenge: secret, sentTo: maskEmail(user.email) };
}
