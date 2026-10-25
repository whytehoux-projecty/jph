"use client";

import * as React from "react";
import Link from "next/link";
import { Check, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { ReviewList } from "@/components/portal/flow";
import { formatAmount } from "@/lib/format";
import { toast } from "@/lib/toast";

export interface DepositAccount {
  id: string;
  /** Type and masked number, e.g. "Checking •••• 6789". */
  label: string;
  /** Full number: shown only through AccountNumber (masked, timed reveal) or copied. */
  accountNumber: string;
  balance: number;
  currency: string;
}

/** Parses a typed amount. Null unless it is a positive number with at most two decimals. */
export function parseAmount(raw: string): number | null {
  const v = raw.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null;
  const n = Number(v);
  return n > 0 ? n : null;
}

export function AccountField({
  accounts,
  value,
  onChange,
  label,
  showBalance,
  locale,
}: {
  accounts: DepositAccount[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  /** Adds the available balance to each option (withdrawals), unless balances are hidden. */
  showBalance?: boolean;
  locale: string;
}) {
  return (
    <FormField label={label}>
      <NativeSelect value={value} onChange={(e) => onChange(e.target.value)}>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {showBalance ? `${a.label} · ${formatAmount(a.balance, { currency: a.currency, locale })} available` : a.label}
          </option>
        ))}
      </NativeSelect>
    </FormField>
  );
}

export function AmountField({
  value,
  onChange,
  error,
  label = "Amount",
  hint,
  currency = "USD",
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  label?: string;
  hint?: string;
  currency?: string;
}) {
  return (
    <FormField label={label} hint={hint} error={error}>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body text-fg-muted">
          {currency === "USD" ? "$" : currency}
        </span>
        <Input
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
          className={currency === "USD" ? "pl-7 tabular-nums" : "pl-14 tabular-nums"}
        />
      </div>
    </FormField>
  );
}

/**
 * A labelled value with a copy button. The toast names what was copied, never
 * the value itself, so account details don't appear in notifications.
 */
export function CopyRow({ label, value, display, mono = true }: { label: string; value: string; display?: React.ReactNode; mono?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success({ title: `${label} copied` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error({ title: "Couldn't copy", description: "Select the text and copy it instead." });
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-small text-fg-muted">{label}</dt>
        <dd className={mono ? "break-all font-code text-body text-fg" : "text-body text-fg"}>{display ?? value}</dd>
      </div>
      <Button
        type="button"
        variant="tertiary"
        size="icon"
        aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
        onClick={copy}
        icon={copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      />
    </div>
  );
}

/** Confirmation after a deposit or withdrawal request; focus moves to its heading. */
export function RequestSent({
  title,
  description,
  rows,
  transactionId,
  onAnother,
  anotherLabel,
  extra,
}: {
  title: string;
  description: React.ReactNode;
  rows: Array<[string, React.ReactNode]>;
  transactionId?: string;
  onAnother: () => void;
  anotherLabel: string;
  extra?: React.ReactNode;
}) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => ref.current?.focus(), []);
  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 size-7 shrink-0 text-success" aria-hidden="true" />
        <div>
          <h3 ref={ref} tabIndex={-1} className="font-sans text-h3 text-fg focus:outline-none">
            {title}
          </h3>
          <p className="mt-1 text-body text-fg-muted">{description}</p>
        </div>
      </div>
      <ReviewList rows={rows} />
      {extra}
      <div className="flex flex-col gap-2 sm:flex-row print:hidden">
        {transactionId && (
          <Button asChild variant="secondary">
            <Link href={`/activities/receipt/${transactionId}`}>View receipt</Link>
          </Button>
        )}
        <Button onClick={onAnother}>{anotherLabel}</Button>
      </div>
    </div>
  );
}
