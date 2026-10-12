"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Info, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Notice {
  id: string;
  tone: "critical" | "info" | "promo";
  title: string;
  message: string;
  href?: string;
  cta?: string;
}

const TONES = {
  critical: {
    wrap: "bg-rose-50 border-rose-200 text-rose-900",
    icon: AlertTriangle,
    iconCls: "text-rose-600",
    label: "Important",
    labelCls: "text-rose-700",
    dot: "bg-rose-600",
  },
  info: {
    wrap: "bg-paper-50 border-paper-200 text-ink-900",
    icon: Info,
    iconCls: "text-ink-600",
    label: "Notice",
    labelCls: "text-ink-500",
    dot: "bg-ink-900",
  },
  promo: {
    wrap: "bg-ink-900 border-ink-900 text-paper-50",
    icon: Sparkles,
    iconCls: "text-amber-300",
    label: "Featured",
    labelCls: "text-amber-300",
    dot: "bg-amber-300",
  },
} as const;

export function NoticeCarousel({
  notices,
  intervalMs = 6000,
  className,
}: {
  notices: Notice[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Critical notices first so they are seen immediately
  const ordered = [...notices].sort(
    (a, b) => Number(b.tone === "critical") - Number(a.tone === "critical")
  );

  useEffect(() => {
    if (paused || ordered.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ordered.length), intervalMs);
    return () => clearInterval(t);
  }, [paused, ordered.length, intervalMs]);

  if (ordered.length === 0) return null;
  const current = ordered[index % ordered.length];
  const tone = TONES[current.tone];
  const Icon = tone.icon;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "relative overflow-hidden rounded-sm border p-6 md:p-7 flex flex-col justify-between transition-colors duration-500",
        tone.wrap,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div key={current.id} className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-2 mb-3">
          <Icon className={cn("h-4 w-4", tone.iconCls)} />
          <span className={cn("text-[11px] font-mono font-semibold uppercase tracking-wider", tone.labelCls)}>
            {tone.label}
          </span>
        </div>
        <h2 className="text-lg md:text-xl font-display font-semibold leading-snug">{current.title}</h2>
        <p className="mt-1.5 text-sm opacity-80 line-clamp-3">{current.message}</p>
        {current.href && (
          <Link
            href={current.href}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold underline-offset-4 hover:underline"
          >
            {current.cta || "Learn more"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {ordered.length > 1 && (
        <div className="mt-5 flex items-center gap-1.5">
          {ordered.map((n, i) => (
            <button
              key={n.id}
              type="button"
              aria-label={`Show notice ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index % ordered.length ? cn("w-6", tone.dot) : "w-1.5 bg-current opacity-25"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
