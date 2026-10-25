'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { endCustomerSessions, issueNewTemporaryPassword, unlockTransactionPin } from '@/app/actions/admin-customers';
import { TEMP_PASSWORD_TTL_HOURS } from '@/lib/password-policy';

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/**
 * A customer's sign-in credentials, as staff may see them: never the password
 * itself. Staff can issue a new temporary password, which is emailed to the
 * customer (or shown here once, when email isn't set up).
 */
export function TemporaryPasswordPanel({
  userId,
  email,
  isFirstLogin,
  expiresAt,
  pinLockedUntil,
}: {
  userId: string;
  email: string;
  isFirstLogin: boolean;
  expiresAt: string | null;
  /** When the customer's transaction PIN lock ends, if it's locked. */
  pinLockedUntil: string | null;
}) {
  const [pinLock, setPinLock] = useState(pinLockedUntil && new Date(pinLockedUntil).getTime() > Date.now() ? pinLockedUntil : null);
  const [unlocking, setUnlocking] = useState(false);
  const [endingSessions, setEndingSessions] = useState(false);
  const signOutEverywhere = async () => {
    setEndingSessions(true);
    try {
      await endCustomerSessions(userId);
      toast.success('The customer will be signed out on every device within a minute.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not sign the customer out.');
    } finally {
      setEndingSessions(false);
    }
  };
  const unlock = async () => {
    setUnlocking(true);
    try {
      await unlockTransactionPin(userId);
      setPinLock(null);
      toast.success('Transaction PIN unlocked');
    } catch (err: any) {
      toast.error(err?.message || 'Could not unlock the PIN.');
    } finally {
      setUnlocking(false);
    }
  };
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<{ pending: boolean; expiresAt: string | null }>({ pending: isFirstLogin, expiresAt });
  const [shownOnce, setShownOnce] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const expired = state.pending && state.expiresAt ? new Date(state.expiresAt).getTime() < Date.now() : false;

  const issue = async () => {
    setBusy(true);
    try {
      const res = await issueNewTemporaryPassword(userId);
      setState({ pending: true, expiresAt: res.expiresAt });
      setShownOnce(res.password);
      setConfirming(false);
      toast.success(res.emailed ? `Temporary password emailed to ${email}` : 'Temporary password created. Email isn\'t set up, so pass it on yourself.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not issue a temporary password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Login email</span>
          <p className="px-3 py-2 bg-neutral-100 border border-neutral-200 rounded text-sm text-ink-900 font-medium break-all">{email}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Password</span>
          <p className="px-3 py-2 bg-neutral-100 border border-neutral-200 rounded text-sm text-ink-900">
            {!state.pending
              ? 'Set by the customer'
              : expired
                ? `Temporary password expired ${when(state.expiresAt!)}`
                : state.expiresAt
                  ? `Temporary password, works until ${when(state.expiresAt)}`
                  : 'Temporary password (no expiry recorded); issue a new one'}
          </p>
        </div>
      </div>

      {pinLock && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex flex-wrap items-center gap-3">
          <p className="text-sm text-rose-900 flex-1 min-w-[12rem]">
            Transaction PIN locked after too many wrong tries, until {when(pinLock)}. Unlock it only once you&apos;ve confirmed it was the customer.
          </p>
          <Button type="button" size="small" variant="outline" onClick={unlock} disabled={unlocking}>
            {unlocking ? 'Unlocking…' : 'Unlock PIN'}
          </Button>
        </div>
      )}

      {shownOnce && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-900 uppercase mb-1">Shown once: email isn&apos;t set up</p>
          <p className="font-mono font-bold text-lg text-amber-950 select-all">{shownOnce}</p>
          <p className="text-xs text-amber-800 mt-1">Give it to the customer through a verified channel. It isn&apos;t stored and can&apos;t be shown again.</p>
          <Button type="button" size="small" variant="outline" className="mt-2" onClick={() => setShownOnce(null)}>
            Hide
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-neutral-100">
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-ink-900 flex-1 min-w-[12rem]">
              Replace the customer&apos;s current password? They&apos;ll have to sign in with the new temporary one and choose a new password and PIN.
            </p>
            <Button type="button" variant="outline" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" onClick={issue} disabled={busy} className="bg-[#0D2545] hover:bg-[#1B355B] text-white">
              {busy ? 'Issuing…' : 'Issue temporary password'}
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => setConfirming(true)} className="bg-[#0D2545] hover:bg-[#1B355B] text-white">
            Issue a new temporary password
          </Button>
        )}
        <Button type="button" variant="outline" onClick={signOutEverywhere} disabled={endingSessions} className="ml-2">
          {endingSessions ? 'Signing out…' : 'Sign out everywhere'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          The customer gets it by email. It works for {TEMP_PASSWORD_TTL_HOURS} hours, and they choose their own password at next sign-in.
        </p>
      </div>
    </div>
  );
}
