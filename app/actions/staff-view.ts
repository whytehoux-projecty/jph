'use server';

import { redirect } from 'next/navigation';
import { auth, unstable_update } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Staff view: an administrator opens a customer's online banking from the
 * admin portal without the customer's credentials.
 *
 * - Lives inside the admin's own session cookie (no token, nothing in the
 *   URL) and ends when that session ends, or from the portal banner.
 * - The portal's data actions see the customer, because the session presents
 *   the customer's id (auth.config.ts). Admin-only actions are refused while
 *   it is active.
 * - Moving money still needs the customer's transaction PIN.
 * - Start and end are written to the server log (ids and time only) until a
 *   dedicated audit table exists.
 */

export interface StaffViewState {
  customerName: string;
  staffName: string | null;
  startedAt: string;
}

export async function startStaffView(userId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN' || (session as any)?.staffView) throw new Error('Unauthorized');
  if (!userId) throw new Error('Missing customer');

  const exists = await prisma.user.count({ where: { id: userId } });
  if (!exists) throw new Error('Customer not found');

  await unstable_update({ staffView: { userId } } as any);
  console.info(`[audit] staff-view start staff=${session!.user!.id} customer=${userId} at=${new Date().toISOString()}`);
  redirect('/dashboard');
}

export async function endStaffView() {
  const session = await auth();
  const staffView = (session as any)?.staffView;
  if (staffView) {
    await unstable_update({ staffView: null } as any);
    console.info(`[audit] staff-view end staff=${staffView.staffId} customer=${session!.user!.id} at=${new Date().toISOString()}`);
  }
  redirect('/admin/customers/account-holders');
}

/** For the portal banner. Null for a customer's own session. */
export async function getStaffViewState(): Promise<StaffViewState | null> {
  const session = await auth();
  const staffView = (session as any)?.staffView;
  if (!staffView) return null;
  return {
    customerName: staffView.customerName,
    staffName: staffView.staffName,
    startedAt: staffView.startedAt,
  };
}
