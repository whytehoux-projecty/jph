"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastItem } from "@/lib/toast";

/**
 * Toast viewport — docs/DESIGN_SYSTEM.md#toast
 * Renders toasts raised with `toast.success(...)` etc. from lib/toast.ts.
 * Mounted once by PortalLayout. Errors are announced assertively, everything
 * else politely; hovering or focusing a toast pauses its timer.
 */

const VARIANTS: Record<ToastItem["variant"], { bar: string; icon: React.ReactNode }> = {
  success: { bar: "border-l-success", icon: <CheckCircle2 className="size-5 text-success" aria-hidden="true" /> },
  error: { bar: "border-l-danger", icon: <AlertCircle className="size-5 text-danger" aria-hidden="true" /> },
  warning: { bar: "border-l-warning", icon: <AlertTriangle className="size-5 text-warning" aria-hidden="true" /> },
  info: { bar: "border-l-info", icon: <Info className="size-5 text-info" aria-hidden="true" /> },
};

type LiveToast = ToastItem & { exiting?: boolean };

export function ToastViewport() {
  const [toasts, setToasts] = React.useState<LiveToast[]>([]);
  const timers = React.useRef(new Map<string, number>());

  const remove = React.useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 200);
  }, []);

  const schedule = React.useCallback(
    (id: string, ms: number) => {
      window.clearTimeout(timers.current.get(id));
      timers.current.set(id, window.setTimeout(() => remove(id), ms));
    },
    [remove],
  );

  React.useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<ToastItem>).detail;
      setToasts((prev) => [...prev, item]);
      schedule(item.id, item.duration ?? 4000);
    };
    window.addEventListener("av:toast", handler);
    const pending = timers.current;
    return () => {
      window.removeEventListener("av:toast", handler);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, [schedule]);

  const pause = (id: string) => window.clearTimeout(timers.current.get(id));

  const renderToast = (t: LiveToast) => (
    <li
      key={t.id}
      onMouseEnter={() => pause(t.id)}
      onMouseLeave={() => schedule(t.id, 2500)}
      onFocus={() => pause(t.id)}
      onBlur={() => schedule(t.id, 2500)}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-surface border border-l-4 border-line bg-surface px-4 py-3 shadow-overlay",
        "transition-opacity duration-(--duration-base) motion-safe:animate-hv-rise",
        VARIANTS[t.variant].bar,
        t.exiting && "opacity-0",
      )}
    >
      <span className="mt-0.5 shrink-0">{VARIANTS[t.variant].icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-small font-semibold text-fg">{t.title}</p>
        {t.description && <p className="mt-0.5 text-small text-fg-muted">{t.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => remove(t.id)}
        aria-label="Dismiss notification"
        className="-m-2 flex size-9 shrink-0 items-center justify-center rounded-control text-fg-muted hover:bg-surface-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </li>
  );

  const errors = toasts.filter((t) => t.variant === "error");
  const others = toasts.filter((t) => t.variant !== "error");

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-(--z-toast) flex flex-col gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
      <ol role="alert" aria-live="assertive" aria-relevant="additions" className="flex flex-col gap-3">
        {errors.map(renderToast)}
      </ol>
      <ol role="status" aria-live="polite" aria-relevant="additions" className="flex flex-col gap-3">
        {others.map(renderToast)}
      </ol>
    </div>
  );
}
