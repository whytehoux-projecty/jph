"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Building blocks for multi-step money flows (transfers, deposits,
 * withdrawals): step headings, footers, review lists and card-style radios.
 */

export function StepHeading({ id, title, description }: { id: string; title: string; description?: string }) {
  return (
    <div>
      <h3 id={id} tabIndex={-1} className="font-sans text-h4 text-fg focus:outline-none">
        {title}
      </h3>
      {description && <p className="mt-1 text-small text-fg-muted">{description}</p>}
    </div>
  );
}

export function StepFooter({ back, next, hint }: { back?: React.ReactNode; next: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div>{back ?? (hint && <p className="text-small text-fg-muted">{hint}</p>)}</div>
      {next}
    </div>
  );
}

export function BackButton({ onClick, label = "Back", disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}

export function ReviewList({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="divide-y divide-line rounded-surface border border-line">
      {rows.map(([term, value]) => (
        <div key={term} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between sm:gap-6">
          <dt className="text-small text-fg-muted">{term}</dt>
          <dd className="text-body text-fg sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Radio options drawn as cards (native inputs, full keyboard support). */
export function ChoiceCards({
  legend,
  hint,
  name,
  value,
  options,
  icon,
  disabled,
  onChange,
  error,
}: {
  legend: string;
  hint?: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string; description?: string }>;
  icon?: (v: string) => React.ReactNode;
  disabled?: boolean;
  onChange: (v: string) => void;
  error?: string;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errId = error ? `${name}-err` : undefined;
  return (
    <fieldset aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}>
      <legend className="text-small font-semibold text-fg">{legend}</legend>
      {hint && (
        <p id={hintId} className="mt-0.5 text-caption text-fg-muted">
          {hint}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-surface border border-line bg-surface p-4 transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              "has-[:checked]:border-action has-[:checked]:bg-action-subtle hover:border-line-strong",
              disabled && "cursor-not-allowed opacity-70",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              disabled={disabled}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {icon && <span className="mt-0.5 shrink-0 text-fg-action">{icon(o.value)}</span>}
            <span>
              <span className="block text-body font-semibold text-fg">{o.label}</span>
              {o.description && <span className="mt-0.5 block text-small text-fg-muted">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
      <div aria-live="polite">
        {error && (
          <p id={errId} className="mt-2 text-small text-danger">
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}
