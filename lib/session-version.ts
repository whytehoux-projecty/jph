import { prisma } from '@/lib/prisma';

/**
 * Ending sessions on other devices. Each customer and staff member has a
 * session version; their sessions carry the version they signed in with, and
 * auth.ts re-checks it at most every SESSION_CHECK_SECONDS. Raising it ends
 * every open session for that person.
 */
export const SESSION_CHECK_SECONDS = 60;

export type SessionOwner = { kind: 'customer' | 'admin'; id: string };

export async function endAllSessions(owner: SessionOwner): Promise<number> {
  const row =
    owner.kind === 'customer'
      ? await prisma.user.update({ where: { id: owner.id }, data: { sessionVersion: { increment: 1 } }, select: { sessionVersion: true } })
      : await prisma.adminUser.update({ where: { id: owner.id }, data: { sessionVersion: { increment: 1 } }, select: { sessionVersion: true } });
  return row.sessionVersion;
}

/** The current version, or null when the person no longer exists. */
export async function currentSessionVersion(owner: SessionOwner): Promise<number | null> {
  const row =
    owner.kind === 'customer'
      ? await prisma.user.findUnique({ where: { id: owner.id }, select: { sessionVersion: true } })
      : await prisma.adminUser.findUnique({ where: { id: owner.id }, select: { sessionVersion: true } });
  return row?.sessionVersion ?? null;
}
