'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { emailConfigured, sendEmail } from '@/lib/email';
import { consumeResetCode, createResetCode, RESET_CODE_MINUTES } from '@/lib/one-time-codes';
import { meetsPasswordPolicy } from '@/lib/password-policy';
import { BRAND } from '@/src/content/facts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Customers who can reset online: active online banking, and past first sign-in. */
async function resettableUser(email: string) {
  const user = await prisma.user.findFirst({ where: { email: { equals: email.trim(), mode: 'insensitive' } } });
  if (!user || !user.hasOnlineAccess || user.eportalStatus !== 'ACTIVE' || user.isFirstLogin) return null;
  return user;
}

/**
 * Emails a reset code. The answer is the same whether or not the address has
 * an account, so it can't be used to find customers.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!EMAIL.test((email || '').trim())) return { ok: false, error: 'Enter the email address you registered with.' };
  if (!emailConfigured()) return { ok: false, error: "We can't send reset codes right now. Contact us and we'll help you get back in." };

  const user = await resettableUser(email);
  if (user) {
    const code = await createResetCode(user.id);
    if (code) {
      await sendEmail({
        to: user.email,
        subject: `${BRAND.vault} password reset code: ${code}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p style="font-size: 24px; letter-spacing: 4px;"><strong>${code}</strong></p>
          <p>Enter this code on the ${BRAND.vault} reset page to choose a new password. It works for ${RESET_CODE_MINUTES} minutes.</p>
          <p>If you didn't ask for this, you can ignore this email; your password hasn't changed.</p>
        </div>`,
      }).catch(() => undefined);
    }
  }
  return { ok: true };
}

export async function resetPassword(input: { email: string; code: string; password: string }): Promise<
  { ok: true } | { ok: false; field: 'code' | 'password'; error: string }
> {
  if (!meetsPasswordPolicy(input.password || '')) {
    return { ok: false, field: 'password', error: 'Choose a password that meets every rule in the list.' };
  }
  const user = await resettableUser(input.email || '');
  const generic = { ok: false as const, field: 'code' as const, error: "That code isn't right or has expired. Ask for a new one." };
  if (!user) return generic;

  const result = await consumeResetCode(user.id, (input.code || '').replace(/\D/g, ''));
  if (!result.ok) {
    if (result.reason === 'wrong' && result.triesLeft) {
      return { ok: false, field: 'code', error: `That code isn't right. ${result.triesLeft} ${result.triesLeft === 1 ? 'try' : 'tries'} left.` };
    }
    return generic;
  }

  await prisma.user.update({
    where: { id: user.id },
    // Raising the session version signs out every device that was signed in.
    data: {
      password: await bcrypt.hash(input.password, 12),
      loginFailedAttempts: 0,
      loginLockedUntil: null,
      temporaryPasswordExpiresAt: null,
      sessionVersion: { increment: 1 },
    },
  });
  await prisma.notification.create({
    data: { userId: user.id, title: 'Password changed', message: "Your online banking password was reset. If this wasn't you, contact us straight away." },
  });
  await sendEmail({
    to: user.email,
    subject: `${BRAND.vault}: your password was changed`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Your password was changed</h2><p>Your ${BRAND.vault} password was reset just now. If this wasn't you, contact us straight away.</p></div>`,
  }).catch(() => undefined);

  return { ok: true };
}
