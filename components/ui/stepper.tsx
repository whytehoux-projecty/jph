import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stepper — docs/DESIGN_SYSTEM.md#stepper
 * Progress through a multi-step flow. Phones show "Step 2 of 4 · Details";
 * from sm up every step is listed. The current step has aria-current="step".
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  /** Short labels, e.g. ["Details", "Review", "Done"]. */
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
}) {
  return (
    <nav aria-label="Progress" className={className}>
      <p className="text-small text-fg-muted sm:hidden">
        Step {current + 1} of {steps.length}
        <span aria-hidden="true"> · </span>
        <span className="font-semibold text-fg">{steps[current]}</span>
      </p>
      <ol className="hidden items-center gap-2 sm:flex">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-round border text-caption font-semibold tabular-nums",
                  done && "border-action bg-action text-fg-on-action",
                  active && "border-action text-fg-action",
                  !done && !active && "border-line-strong text-fg-muted",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("truncate text-small", active ? "font-semibold text-fg" : "text-fg-muted")}>
                {label}
                {done && <span className="sr-only"> (completed)</span>}
              </span>
              {i < steps.length - 1 && <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-line" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
