import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — docs/DESIGN_SYSTEM.md#empty-state
 * Says what is missing, why, and what the customer can do next. Never a
 * placeholder for unbuilt features.
 */
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** One primary action, optionally followed by a secondary one. */
  action?: React.ReactNode;
  /** Heading level for the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  headingLevel = 3,
  compact = false,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-12",
        className,
      )}
    >
      {Icon && (
        <span className="mb-1 flex size-12 items-center justify-center rounded-round bg-surface-muted text-fg-muted">
          <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
      )}
      <Heading className="font-sans text-h4 text-fg">{title}</Heading>
      {description && <p className="max-w-(--container-measure) text-small text-fg-muted">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
