"use client";

import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface PromoBannerProps {
  title: string;
  body: string;
  ctaLabel: string;
  onCtaClick?: () => void;
  onDismiss: () => void;
  className?: string;
}

export function PromoBanner({ title, body, ctaLabel, onCtaClick, onDismiss, className }: PromoBannerProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-soft-gold/30 bg-soft-gold/10 px-5 py-4", className)}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--heritage-navy)]">
          {title}
        </p>
        <p className="text-sm text-charcoal/80 mt-1">
          {body}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="outline"
          size="small"
          className="h-9 border-[color:var(--heritage-navy)]/40 text-[color:var(--heritage-navy)] text-sm font-medium hover:bg-[color:var(--heritage-navy)] hover:text-white transition-colors"
          onClick={onCtaClick}>
          {ctaLabel}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-muted-foreground hover:text-charcoal font-medium underline-offset-4 hover:underline transition-all">
          Dismiss
        </button>
      </div>
    </div>
  );
}
