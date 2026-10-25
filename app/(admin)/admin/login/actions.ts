'use server';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { emailConfigured, sendEmail } from '@/lib/email';
import { checkPasswordWithLimit, minutesLeft } from '@/lib/sign-in-guard';
import { createSignInChallenge, SIGN_IN_CODE_MINUTES } from '@/lib/one-time-codes';
import { BRAND } from '@/src/content/facts';

export type BeginAdminSignInResult =
  | { status: 'no-match' }
  | { status: 'locked'; minutes: number }
  | { status: 'ready'; challenge: string }
  | { status: 'code-sent'; challenge: string };

let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hash(randomBytes(16).toString('hex'), 12));

/** Staff codes: on with ADMIN_SIGN_IN_EMAIL_CODES=required, and only when email can be sent. */
function codesRequired() {
  if (process.env.ADMIN_SIGN_IN_EMAIL_CODES !== 'required') return false;
  if (!emailConfigured()) {
    console.error('[admin sign-in] ADMIN_SIGN_IN_EMAIL_CODES=required but email is not configured; codes are not being sent.');
    return false;
  }
  return true;
}

/**
 * Step one of staff sign-in: the password, with the wrong-try limit, then a
 * short-lived challenge (and an emailed code when required). Same pattern as
 * customer sign-in (app/(portal)/login/actions.ts).
 */
export async function beginAdminSignIn(input: { email: string; password: string }): Promise<BeginAdminSignInResult> {
  const email = (input.email || '').trim();
  const password = input.password || '';
  if (!email || !password) return { status: 'no-match' };

  const admin = await prisma.adminUser.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
  if (!admin) {
    await bcrypt.compare(password, await getDummyHash());
    return { status: 'no-match' };
  }

  const check = await checkPasswordWithLimit(
    { kind: 'admin', id: admin.id, email: admin.email, stored: admin.password },
    password,
    // Admin rows created before hashing are upgraded to bcrypt on first sign-in.
    (hash) => prisma.adminUser.update({ where: { id: admin.id }, data: { password: hash } }),
  );
  if (!check.ok) return check.lockedUntil ? { status: 'locked', minutes: minutesLeft(check.lockedUntil) } : { status: 'no-match' };

  const { secret, code } = await createSignInChallenge({ kind: 'admin', id: admin.id }, codesRequired());
  if (!code) return { status: 'ready', challenge: secret };

  await sendEmail({
    to: admin.email,
    subject: `${BRAND.vault} staff sign-in code: ${code}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your staff sign-in code</h2>
      <p style="font-size: 24px; letter-spacing: 4px;"><strong>${code}</strong></p>
      <p>It works for ${SIGN_IN_CODE_MINUTES} minutes. If you didn't just sign in to the admin portal, change your password and tell your security team.</p>
    </div>`,
  });
  return { status: 'code-sent', challenge: secret };
}
