"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { groupAccountNumber, maskAccountNumber } from "@/lib/format";

/**
 * AccountNumber — docs/DESIGN_SYSTEM.md#account-number
 *
 * Masked by default ("•••• 6789"). With `revealable`, a button shows the
 * full number for 30 seconds, then masks it again. The full number is never
 * written to storage, the URL or the console by this component.
 */
export interface AccountNumberProps {
  value: string | null | undefined;
  /** Allow the customer to reveal the full number. */
  revealable?: boolean;
  /** Digits kept visible when masked. */
  visibleDigits?: number;
  /** Used in the reveal button's accessible name, e.g. "checking account". */
  label?: string;
  className?: string;
}

const REVEAL_MS = 30_000;

export function AccountNumber({
  value,
  revealable = false,
  visibleDigits = 4,
  label = "account",
  className,
}: AccountNumberProps) {
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    if (!revealed) return;
    const t = window.setTimeout(() => setRevealed(false), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [revealed]);

  const masked = maskAccountNumber(value, visibleDigits);
  const lastDigits = value ? value.replace(/[^0-9A-Za-z]/g, "").slice(-visibleDigits) : "";

  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums text-fg", className)}>
      {revealed && value ? (
        <span>{groupAccountNumber(value)}</span>
      ) : (
        <>
          <span aria-hidden="true">{masked}</span>
          <span className="sr-only">
            {lastDigits ? `ending in ${lastDigits.split("").join(" ")}` : "not available"}
          </span>
        </>
      )}
      {revealable && value && (
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-pressed={revealed}
          aria-label={revealed ? `Hide ${label} number` : `Show full ${label} number`}
          className={cn(
            "-my-2 inline-flex size-11 items-center justify-center rounded-control text-fg-muted",
            "transition-colors duration-(--duration-fast) hover:bg-surface-muted hover:text-fg",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus",
          )}
        >
          {revealed ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      )}
    </span>
  );
}
