"use client";

import { useEffect, useRef } from "react";
import { logoutAction } from "@/app/actions/auth";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const lastActive = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if the user is idle every minute
    const checkIdleStatus = () => {
      const now = Date.now();
      if (now - lastActive.current > IDLE_TIMEOUT_MS) {
        // Log out user
        logoutAction();
      }
    };

    const resetIdleTimer = () => {
      lastActive.current = Date.now();
    };

    // Events to track user activity
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Check periodically
    timeoutRef.current = setInterval(checkIdleStatus, 60000);

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

  return <>{children}</>;
}
