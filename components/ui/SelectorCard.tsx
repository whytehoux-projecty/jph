"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectorCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** Custom-designed icon node (SVG). */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  selected?: boolean;
  badge?: string;
  /** "radio" for single-choice groups, "tab" for tab-nav cards, "button" for plain actions. */
  role?: "radio" | "tab" | "button";
  /** Layout: "stack" mirrors the /apply cards, "row" is a horizontal large card. */
  layout?: "stack" | "row";
  size?: "md" | "lg";
}

/**
 * Generalised version of the /apply Personal / Business card-buttons.
 * Same tokens (ink / paper), now with focus, disabled and ARIA semantics.
 */
export const SelectorCard = React.forwardRef<HTMLButtonElement, SelectorCardProps>(
  (
    {
      icon,
      title,
      description,
      selected = false,
      badge,
      role = "button",
      layout = "stack",
      size = "md",
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const aria =
      role === "radio"
        ? { role: "radio" as const, "aria-checked": selected }
        : role === "tab"
          ? { role: "tab" as const, "aria-selected": selected }
          : { "aria-pressed": selected };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        {...aria}
        {...props}
        className={cn(
          "group relative w-full rounded border text-left transition-all duration-200 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-50",
          layout === "stack"
            ? "flex flex-col items-start gap-3"
            : "flex items-center gap-4",
          size === "lg" ? "p-6" : "p-4",
          selected
            ? "bg-vermilion-600 border-vermilion-600 text-white shadow-[0_10px_30px_-12px_rgba(20,24,31,0.55)]"
            : "bg-paper-50 border-paper-300 text-ink-700 hover:border-ink-900 hover:-translate-y-0.5",
          disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:border-paper-300",
          className,
        )}
      >
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 inline-flex items-center justify-center rounded transition-colors",
              size === "lg" ? "h-14 w-14" : "h-10 w-10",
              selected ? "bg-white/20 text-white" : "bg-paper-100 text-ink-900",
            )}
          >
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "font-display font-semibold leading-tight",
                size === "lg" ? "text-lg" : "text-small",
                selected ? "text-white" : "text-ink-900",
              )}
            >
              {title}
            </span>
            {badge && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  selected ? "bg-vermilion-600 text-white" : "bg-vermilion-100 text-vermilion-700",
                )}
              >
                {badge}
              </span>
            )}
          </span>
          {description && (
            <span
              className={cn(
                "mt-1 block text-xs leading-snug",
                selected ? "text-white/80" : "text-ink-500",
              )}
            >
              {description}
            </span>
          )}
        </span>
      </button>
    );
  },
);
SelectorCard.displayName = "SelectorCard";
