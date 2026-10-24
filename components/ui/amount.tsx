"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAmount, MASK } from "@/lib/format";

/**
 * Amount — docs/DESIGN_SYSTEM.md#amount
 *
 * Every monetary value in the portal goes through this component: locale
 * currency formatting, tabular figures, credit/debit styling and masking.
 *
 * tone="auto"  credits (> 0) take the credit colour and an explicit "+";
 *              debits stay ink with the minus sign. Use for transactions.
 * tone="plain" balances and totals: ink, no forced sign.
 */

export interface AmountProps {
  value: number | string | null | undefined;
  currency?: string;
  locale?: string;
  tone?: "auto" | "plain";
  /** Hide the figure (e.g. the customer's "hide balances" preference). */
  masked?: boolean;
  size?: "sm" | "md" | "lg" | "figure";
  className?: string;
}

const sizeClass = {
  sm: "text-small",
  md: "text-data",
  lg: "text-data-lg",
  figure: "text-figure",
} as const;

export function Amount({
  value,
  currency = "USD",
  locale = "en-US",
  tone = "plain",
  masked = false,
  size = "md",
  className,
}: AmountProps) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  const isNumber = typeof n === "number" && Number.isFinite(n);

  if (masked) {
    return (
      <span className={cn("font-sans tabular-nums text-fg", sizeClass[size], className)}>
        <span aria-hidden="true">{MASK}</span>
        <span className="sr-only">Amount hidden</span>
      </span>
    );
  }

  if (!isNumber) {
    return (
      <span className={cn("font-sans tabular-nums text-fg-muted", sizeClass[size], className)}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not available</span>
      </span>
    );
  }

  const isCredit = tone === "auto" && n > 0;
  const formatted = formatAmount(n, {
    currency,
    locale,
    signDisplay: tone === "auto" ? "exceptZero" : "auto",
  });

  return (
    <span
      className={cn(
        "font-sans tabular-nums lining-nums whitespace-nowrap",
        sizeClass[size],
        isCredit ? "text-amount-credit" : "text-amount-debit",
        className,
      )}
    >
      {formatted}
    </span>
  );
}

/**
 * Show/hide toggle for amounts. Controlled: the screen owns the state (and
 * persists it through the existing profile preference, never localStorage).
 */
export function AmountVisibilityToggle({
  hidden,
  onHiddenChange,
  className,
}: {
  hidden: boolean;
  onHiddenChange: (hidden: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onHiddenChange(!hidden)}
      aria-pressed={hidden}
      aria-label={hidden ? "Show balances" : "Hide balances"}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-control text-fg-muted",
        "transition-colors duration-(--duration-fast) hover:bg-surface-muted hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus",
        className,
      )}
    >
      {hidden ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
    </button>
  );
}
