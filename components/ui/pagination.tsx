"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pagination — docs/DESIGN_SYSTEM.md#pagination
 * Controlled. On small screens shows "Page x of y" with previous/next; from
 * sm up it adds page numbers with ellipses.
 */
export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Accessible name of the nav, e.g. "Transactions pages". */
  label?: string;
  className?: string;
}

function pageList(page: number, count: number): Array<number | "gap"> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const itemBase =
  "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-control px-3 text-small font-semibold transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus disabled:cursor-not-allowed disabled:text-fg-disabled";

export function Pagination({ page, pageCount, onPageChange, label = "Pagination", className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const go = (p: number) => onPageChange(Math.min(pageCount, Math.max(1, p)));

  return (
    <nav aria-label={label} className={cn("flex items-center justify-between gap-2 sm:justify-center", className)}>
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={cn(itemBase, "text-fg hover:bg-surface-muted")}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span>Previous</span>
      </button>

      <p className="text-small text-fg-muted sm:hidden" aria-live="polite">
        Page {page} of {pageCount}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {pageList(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-fg-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => go(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={cn(
                  itemBase,
                  "tabular-nums",
                  p === page ? "bg-action text-fg-on-action" : "text-fg hover:bg-surface-muted",
                )}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        className={cn(itemBase, "text-fg hover:bg-surface-muted")}
      >
        <span>Next</span>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
