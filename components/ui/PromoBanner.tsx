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
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-vermilion-600/30 bg-vermilion-600/10 px-5 py-4", className)}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-900">
          {title}
        </p>
        <p className="text-sm text-ink-900/80 mt-1">
          {body}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="outline"
          size="small"
          className="h-9 border-ink-900/40 text-ink-900 text-sm font-medium hover:bg-ink-900 hover:text-white transition-colors"
          onClick={onCtaClick}>
          {ctaLabel}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-muted-foreground hover:text-ink-900 font-medium underline-offset-4 hover:underline transition-all">
          Dismiss
        </button>
      </div>
    </div>
  );
}
