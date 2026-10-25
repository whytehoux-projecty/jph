"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Checkbox and Radio — docs/DESIGN_SYSTEM.md#checkbox-and-radio
 * Native inputs (full keyboard and form support) drawn with tokens via
 * appearance-none. The label wraps the control, so the whole row is the
 * 44 px target.
 */

const boxBase = [
  "peer relative shrink-0 appearance-none size-5 border border-line-strong bg-surface",
  "transition-colors duration-(--duration-fast) ease-standard",
  "hover:border-fg",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
  "checked:border-action checked:bg-action",
  "aria-invalid:border-danger",
  "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-muted",
  "disabled:checked:bg-fg-disabled disabled:checked:border-fg-disabled",
].join(" ");

interface ChoiceProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
}

function ChoiceRow({
  control,
  label,
  description,
  disabled,
  className,
  descriptionId,
}: {
  control: React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  descriptionId?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-(--size-target) cursor-pointer items-start gap-3 py-2.5",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      <span className="relative mt-0.5 flex">{control}</span>
      <span className="flex flex-col gap-0.5">
        <span className={cn("text-body text-fg", disabled && "text-fg-disabled")}>{label}</span>
        {description && (
          <span id={descriptionId} className="text-small text-fg-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export const Checkbox = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ label, description, className, disabled, ...props }, ref) => {
    const id = React.useId();
    const descriptionId = description ? `${id}-desc` : undefined;
    return (
      <ChoiceRow
        label={label}
        description={description}
        disabled={disabled}
        className={className}
        descriptionId={descriptionId}
        control={
          <>
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              aria-describedby={descriptionId}
              className={cn(boxBase, "rounded-control")}
              {...props}
            />
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-5 text-fg-on-action opacity-0 peer-checked:opacity-100"
            >
              <path d="M5 10.5l3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </>
        }
      />
    );
  },
);
Checkbox.displayName = "Checkbox";

export const Radio = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ label, description, className, disabled, ...props }, ref) => {
    const id = React.useId();
    const descriptionId = description ? `${id}-desc` : undefined;
    return (
      <ChoiceRow
        label={label}
        description={description}
        disabled={disabled}
        className={className}
        descriptionId={descriptionId}
        control={
          <>
            <input
              ref={ref}
              type="radio"
              disabled={disabled}
              aria-describedby={descriptionId}
              className={cn(boxBase, "rounded-round checked:bg-surface")}
              {...props}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-round bg-action opacity-0 peer-checked:opacity-100 peer-disabled:bg-fg-disabled"
            />
          </>
        }
      />
    );
  },
);
Radio.displayName = "Radio";

/** Groups radios (or checkboxes) under one legend. */
export function ChoiceGroup({
  legend,
  hint,
  error,
  children,
  className,
}: {
  legend: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <fieldset
      className={cn("flex flex-col", className)}
      aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend className="mb-1 text-small font-semibold text-fg">{legend}</legend>
      {hint && (
        <p id={hintId} className="mb-1 text-caption text-fg-muted">
          {hint}
        </p>
      )}
      {children}
      <div aria-live="polite">
        {error && (
          <p id={errorId} className="mt-1 text-small text-danger">
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}
