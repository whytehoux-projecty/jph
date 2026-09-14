/**
 * Lightweight event-based toast notification system.
 * No external packages required — dispatches CustomEvents on window,
 * consumed by the toast container in EBankingLayout.tsx.
 *
 * Usage:
 *   toast.success({ title: 'Saved' })
 *   toast.error({ title: 'Failed', description: 'Try again.' })
 *   toast.warn({ title: 'Warning' })
 *   toast.info({ title: 'Info', duration: 6000 })
 */

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  /** Auto-dismiss duration in ms. Default: 4000 */
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

function emit(variant: ToastVariant, options: ToastOptions): void {
  if (typeof window === "undefined") return;
  const detail: ToastItem = {
    ...options,
    variant,
    id: crypto.randomUUID(),
    duration: options.duration ?? 4000,
  };
  window.dispatchEvent(new CustomEvent("av:toast", { detail }));
}

export const toast = {
  success: (options: ToastOptions) => emit("success", options),
  error: (options: ToastOptions) => emit("error", options),
  warn: (options: ToastOptions) => emit("warning", options),
  info: (options: ToastOptions) => emit("info", options),
};
