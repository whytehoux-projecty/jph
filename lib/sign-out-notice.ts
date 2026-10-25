/**
 * Tells the sign-in screen why the customer just landed there, so it can say
 * "You've signed out" or "We signed you out after a period of inactivity".
 *
 * Stores only the reason — no identifiers, no account data — in
 * sessionStorage, which is scoped to this tab and read exactly once. The
 * sign-out redirect itself (logoutAction → /login) is unchanged.
 */
export type SignOutReason = "signed-out" | "idle";

const KEY = "hv:sign-out-reason";

export function setSignOutReason(reason: SignOutReason): void {
  try {
    window.sessionStorage.setItem(KEY, reason);
  } catch {
    // Storage blocked (private mode): the sign-in page simply shows no notice.
  }
}

export function consumeSignOutReason(): SignOutReason | null {
  try {
    const value = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return value === "signed-out" || value === "idle" ? value : null;
  } catch {
    return null;
  }
}
