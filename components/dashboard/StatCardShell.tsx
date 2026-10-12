import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared skeleton for the four overview stat cards.
 * Owns container, top rule, padding, min-height, caption and empty state.
 */
export function StatCardShell({
  caption,
  empty = false,
  emptyHint,
  className,
  children,
}: {
  caption: string;
  empty?: boolean;
  emptyHint?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={caption}
      className={cn(
        "group relative overflow-hidden bg-paper-50 border border-paper-200 text-ink-900 rounded-sm shadow-none p-4 min-h-[148px] flex flex-col transition-colors duration-200 hover:border-ink-900/30",
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-paper-200 group-hover:bg-ink-900/20 transition-colors" />
      <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-ink-400">
        {caption}
      </span>
      {empty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-mono font-medium text-ink-400">No Data/Info</p>
          {emptyHint && <p className="text-[11px] font-mono text-ink-400 mt-1">{emptyHint}</p>}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-2 mt-2 min-w-0">{children}</div>
      )}
    </section>
  );
}

/** One labelled row: leading label (optionally with icon) and a right-aligned value. */
export function SplitRow({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
  icon?: ReactNode;
}) {
  const color =
    tone === "positive" ? "text-emerald-700" : tone === "negative" ? "text-rose-700" : "text-ink-900";
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className={cn("flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-ink-500 shrink-0")}>
        {icon}
        {label}
      </span>
      <span
        title={value}
        className={cn("text-sm xl:text-base font-bold font-mono tabular-nums truncate", color)}
      >
        {value}
      </span>
    </div>
  );
}
