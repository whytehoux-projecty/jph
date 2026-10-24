"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { setSignOutReason } from "@/lib/sign-out-notice";
import { signOutNow } from "@/components/auth/SignOutDialog";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_MS = 60 * 1000; // warn during the last minute
const CHECK_INTERVAL_MS = 1000;

export function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const lastActive = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveRef = useRef<NodeJS.Timeout | null>(null);
  const signingOut = useRef(false);
  // While the warning is showing, only an explicit answer keeps the session.
  const warningOpen = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const staySignedIn = useCallback(() => {
    lastActive.current = Date.now();
    warningOpen.current = false;
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    const checkIdleStatus = () => {
      const idle = Date.now() - lastActive.current;
      if (idle > IDLE_TIMEOUT_MS) {
        if (signingOut.current) return;
        signingOut.current = true;
        // Log out user
        setSignOutReason("idle");
        logoutAction();
      } else if (idle > IDLE_TIMEOUT_MS - WARNING_MS) {
        warningOpen.current = true;
        setSecondsLeft(Math.ceil((IDLE_TIMEOUT_MS - idle) / 1000));
      } else {
        setSecondsLeft(null);
      }
    };

    const resetIdleTimer = () => {
      if (warningOpen.current) return;
      lastActive.current = Date.now();
    };

    // Events to track user activity
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Check periodically
    timeoutRef.current = setInterval(checkIdleStatus, CHECK_INTERVAL_MS);

    // Keep-alive ping for short-lived sessions (maxAge: 60s in auth.config.ts)
    // This runs every 15 seconds to instruct NextAuth to slide the session expiration
    keepAliveRef.current = setInterval(() => {
      fetch('/api/auth/session');
    }, 15000);

    // Also check on visibility change (e.g., returning to the tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkIdleStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      if (timeoutRef.current) clearInterval(timeoutRef.current);
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const open = secondsLeft !== null;
  const minutes = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const seconds = secondsLeft !== null ? secondsLeft % 60 : 0;

  return (
    <>
      {children}
      <Dialog open={open} onOpenChange={(next) => !next && staySignedIn()}>
        <DialogContent role="alertdialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you still there?</DialogTitle>
            <DialogDescription>
              For your security, we&rsquo;ll sign you out soon because there&rsquo;s been no activity.
            </DialogDescription>
          </DialogHeader>
          {/* Visual countdown only; the description above is what gets announced. */}
          <p className="text-body text-fg" aria-hidden="true">
            Signing out in{" "}
            <span className="font-semibold tabular-nums">
              {minutes}:{String(seconds).padStart(2, "0")}
            </span>
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => signOutNow()}>
              Sign out
            </Button>
            <Button onClick={staySignedIn} autoFocus>
              Stay signed in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
