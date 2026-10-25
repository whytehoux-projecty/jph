import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { BRAND } from '@/src/content/facts';

/** Wrong PINs in a row before PIN-protected actions are locked. */
export const MAX_PIN_ATTEMPTS = 5;
/** How long the lock lasts (staff can lift it sooner from the customer's profile). */
export const PIN_LOCK_MINUTES = 30;

const timeLabel = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';

function lockedMessage(until: Date) {
  return `Your transaction PIN is locked after too many wrong tries. Try again after ${timeLabel(until)}, or contact us.`;
}

/**
 * Checks a customer's transaction PIN before money moves (or the PIN is
 * changed). Returns null when it matches, or the message to show next to the
 * PIN field. Server-side only.
 *
 * After MAX_PIN_ATTEMPTS wrong PINs in a row, every PIN-protected action is
 * refused for PIN_LOCK_MINUTES and the customer is told by notification and
 * email. Each try is claimed in the database *before* the PIN is compared,
 * and only while fewer than MAX_PIN_ATTEMPTS are used, so a burst of
 * parallel guesses can't test more PINs than the limit.
 */
export async function checkTransactionPin(userId: string, pin: string, action: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { transactionPin: true } });
  if (!user?.transactionPin) return `Set up a transaction PIN in Settings before ${action}.`;

  const now = new Date();
  // A lock that has run out starts the count again.
  await prisma.user.updateMany({
    where: { id: userId, pinLockedUntil: { lte: now } },
    data: { pinLockedUntil: null, pinFailedAttempts: 0 },
  });

  const claimed = await prisma.user.updateMany({
    where: { id: userId, pinLockedUntil: null, pinFailedAttempts: { lt: MAX_PIN_ATTEMPTS } },
    data: { pinFailedAttempts: { increment: 1 } },
  });
  if (claimed.count === 0) return lockedMessage(await lockUntil(userId, now));

  if (await bcrypt.compare(pin || '', user.transactionPin)) {
    await prisma.user.update({ where: { id: userId }, data: { pinFailedAttempts: 0, pinLockedUntil: null } });
    return null;
  }

  const { pinFailedAttempts } = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { pinFailedAttempts: true } });
  if (pinFailedAttempts >= MAX_PIN_ATTEMPTS) return lockedMessage(await lockUntil(userId, now));

  const left = MAX_PIN_ATTEMPTS - pinFailedAttempts;
  return `That PIN isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left before it's locked for ${PIN_LOCK_MINUTES} minutes.`;
}

/**
 * Starts the lock if it isn't already running (telling the customer once)
 * and returns when it ends.
 */
async function lockUntil(userId: string, now: Date): Promise<Date> {
  const until = new Date(now.getTime() + PIN_LOCK_MINUTES * 60_000);
  const started = await prisma.user.updateMany({
    where: { id: userId, pinLockedUntil: null, pinFailedAttempts: { gte: MAX_PIN_ATTEMPTS } },
    data: { pinLockedUntil: until },
  });
  if (started.count > 0) {
    await tellCustomerPinLocked(userId, until);
    return until;
  }
  const current = await prisma.user.findUnique({ where: { id: userId }, select: { pinLockedUntil: true } });
  return current?.pinLockedUntil ?? until;
}

async function tellCustomerPinLocked(userId: string, until: Date) {
  const title = 'Your transaction PIN was locked';
  const message = `Your PIN was entered wrongly ${MAX_PIN_ATTEMPTS} times, so payments that need it are paused until ${timeLabel(until)}. If this wasn't you, contact us straight away.`;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  await prisma.notification.create({ data: { userId, title, message } });
  if (!user?.email) return;
  try {
    await sendEmail({
      to: user.email,
      subject: `${BRAND.vault}: ${title.toLowerCase()}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>${title}</h2><p>${message}</p></div>`,
    });
  } catch {
    // sendEmail logs the failure (without the recipient); the notification is the record.
  }
}
