"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FormField — docs/DESIGN_SYSTEM.md#form-field
 *
 * Wraps one control with its label, optional hint and error. Controls from
 * components/ui (Input, Textarea, PasswordInput, OtpInput, NativeSelect,
 * SelectTrigger) read the context below and wire up id, aria-describedby,
 * aria-invalid and aria-required on their own.
 *
 *   <FormField label="Payee name" hint="As it appears on their account" error={errors.name?.message} required>
 *     <Input {...register("name")} />
 *   </FormField>
 */

interface FormFieldContextValue {
  id: string;
  hintId?: string;
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function useFormField() {
  return React.useContext(FormFieldContext);
}

/** Merges field context into a control's own props. Explicit props win. */
export function useFieldControlProps<
  P extends {
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: React.AriaAttributes["aria-invalid"];
    "aria-required"?: React.AriaAttributes["aria-required"];
    disabled?: boolean;
  },
>(props: P): P {
  const field = useFormField();
  if (!field) return props;
  const describedBy = [props["aria-describedby"], field.hintId, field.errorId]
    .filter(Boolean)
    .join(" ");
  return {
    ...props,
    id: props.id ?? field.id,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    "aria-required": props["aria-required"] ?? (field.required || undefined),
    disabled: props.disabled ?? (field.disabled || undefined),
  };
}

export interface FormFieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** Shows "(optional)" after the label. Use instead of marking required fields. */
  optional?: boolean;
  disabled?: boolean;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  /** Override the generated control id. */
  id?: string;
  className?: string;
}

export function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  optional = false,
  disabled = false,
  hideLabel = false,
  id,
  className,
}: FormFieldProps) {
  const generatedId = React.useId();
  const controlId = id ?? `field-${generatedId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  const value = React.useMemo<FormFieldContextValue>(
    () => ({ id: controlId, hintId, errorId, invalid: !!error, required, disabled }),
    [controlId, hintId, errorId, error, required, disabled],
  );

  return (
    <FormFieldContext.Provider value={value}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label
          id={`${controlId}-label`}
          htmlFor={controlId}
          className={cn(
            "text-small font-semibold text-fg",
            disabled && "text-fg-disabled",
            hideLabel && "sr-only",
          )}
        >
          {label}
          {optional && <span className="ml-1 font-normal text-fg-muted">(optional)</span>}
        </label>
        {hint && (
          <p id={hintId} className="text-caption text-fg-muted">
            {hint}
          </p>
        )}
        {children}
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    </FormFieldContext.Provider>
  );
}

/** Error text for a control. Announced politely when it appears. */
export function FieldError({ id, children, className }: { id?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div aria-live="polite" className={cn(!children && "sr-only")}>
      {children ? (
        <p id={id} className={cn("flex items-start gap-1.5 text-small text-danger", className)}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{children}</span>
        </p>
      ) : null}
    </div>
  );
}
