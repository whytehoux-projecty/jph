import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Checks a customer's transaction PIN before money moves. Returns null when
 * it matches, or the message to show next to the PIN field. Server-side only.
 */
export async function checkTransactionPin(userId: string, pin: string, action: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { transactionPin: true } });
  if (!user?.transactionPin) return `Set up a transaction PIN in Settings before ${action}.`;
  if (!(await bcrypt.compare(pin || '', user.transactionPin))) return "That PIN isn't right. Try again.";
  return null;
}
