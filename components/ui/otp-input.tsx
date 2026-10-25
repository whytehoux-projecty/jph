"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormField } from "./form-field";

export interface OtpInputProps {
  /** Number of digits, 4–8. */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Called once every box is filled. */
  onComplete?: (value: string) => void;
  /** Show dots instead of digits (transaction PINs). */
  masked?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Accessible name when not inside a FormField, e.g. "Verification code". */
  "aria-label"?: string;
  name?: string;
  className?: string;
}

/**
 * One-time code / PIN entry — docs/DESIGN_SYSTEM.md#otp-input
 * Digits only. Supports paste of the full code, SMS autofill
 * (autocomplete="one-time-code"), arrow keys and backspace across boxes.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  masked = false,
  disabled,
  autoFocus,
  name,
  className,
  "aria-label": ariaLabel,
}: OtpInputProps) {
  const field = useFormField();
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const isDisabled = disabled ?? field?.disabled;
  const groupLabelId = field ? `${field.id}-label` : undefined;

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const focusBox = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const handleChange = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // A paste or autofill can land in any box: spread it from that box.
    const next = (value.slice(0, i) + typed).slice(0, length);
    const clean = commit(next);
    focusBox(Math.min(clean.length, length - 1));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        commit(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        commit(value.slice(0, i - 1) + value.slice(i));
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  const describedBy = [field?.hintId, field?.errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      role="group"
      aria-label={groupLabelId ? undefined : ariaLabel}
      aria-labelledby={groupLabelId}
      aria-describedby={describedBy}
      className={cn("flex gap-2", className)}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          id={i === 0 ? field?.id : undefined}
          name={name ? `${name}-${i}` : undefined}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={d}
          disabled={isDisabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={field?.invalid || undefined}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-12 rounded-control border border-line-strong bg-surface text-center text-h3 font-semibold text-fg tabular-nums",
            "transition-colors duration-(--duration-fast) ease-standard hover:border-fg",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus focus-visible:border-focus",
            "aria-invalid:border-danger",
            "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-muted disabled:text-fg-disabled",
          )}
        />
      ))}
    </div>
  );
}
