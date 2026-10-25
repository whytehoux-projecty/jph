import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateTemporaryPassword } from '@/lib/temporary-password';
import { BRAND } from '@/src/content/facts';
import { TEMP_PASSWORD_TTL_HOURS } from '@/lib/password-policy';


const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Gives a customer a new temporary password: only its hash is stored (never
 * the password itself), it expires after TEMP_PASSWORD_TTL_HOURS, and the
 * customer must replace it at first sign-in (/onboarding). The password is
 * emailed to the customer and returned so staff can pass it on once if email
 * isn't set up; it can't be looked up again afterwards.
 *
 * Server-side only. Callers check that the requester is an administrator.
 */
export async function issueTemporaryPassword(
  userId: string,
  {
    grantOnlineAccess = false,
    activatePortal = false,
    signInHint,
    extra = {},
  }: {
    /** Sets hasOnlineAccess. */
    grantOnlineAccess?: boolean;
    /** Also sets eportalStatus to ACTIVE (lifts a suspension). */
    activatePortal?: boolean;
    /** How the customer signs in, e.g. "your email address". */
    signInHint?: string;
    /** Other fields to save in the same update (e.g. the starting tier). */
    extra?: { tier?: string };
  } = {},
) {
  const password = generateTemporaryPassword();
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_HOURS * 3_600_000);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      password: await bcrypt.hash(password, 12),
      isFirstLogin: true,
      temporaryPassword: null,
      temporaryPasswordExpiresAt: expiresAt,
      // Signs out every device: the customer starts again with the new password.
      sessionVersion: { increment: 1 },
      ...(grantOnlineAccess ? { hasOnlineAccess: true } : {}),
      ...(activatePortal ? { eportalStatus: 'ACTIVE' } : {}),
      ...extra,
    },
    select: { email: true, firstName: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '';
  const expiry = expiresAt.toUTCString().replace(' GMT', ' UTC');
  const emailed = await sendEmail({
    to: user.email,
    subject: `Your ${BRAND.vault} temporary password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #14181C;">
        <h2>Sign in to ${BRAND.vault}</h2>
        <p>Dear ${escapeHtml(user.firstName || 'customer')},</p>
        <p>Sign in with ${escapeHtml(signInHint || 'your email address')} and this temporary password:</p>
        <p style="font-size: 18px;"><strong>${escapeHtml(password)}</strong></p>
        <p>It works until <strong>${expiry}</strong>. When you sign in you'll choose your own password and a transaction PIN, and this one stops working.</p>
        ${baseUrl ? `<p><a href="${baseUrl}/login">Sign in to ${BRAND.vault}</a></p>` : ''}
        <p>If you didn't expect this email, contact us.</p>
        <p>${BRAND.shortName}</p>
      </div>`,
  })
    .then((r) => !(r as { mock?: boolean }).mock)
    .catch(() => false);

  return { password, expiresAt, emailed };
}

/** True when a customer's temporary password has passed its expiry. */
export function temporaryPasswordExpired(user: { isFirstLogin: boolean; temporaryPasswordExpiresAt: Date | null }) {
  return user.isFirstLogin && !!user.temporaryPasswordExpiresAt && user.temporaryPasswordExpiresAt.getTime() < Date.now();
}
