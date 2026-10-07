"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SelectorCard } from "@/components/ui/SelectorCard";
import { cn } from "@/lib/utils";
import { lookupInternalAccount, submitTransfer } from "@/app/actions/transfer";
import {
  DEMO_RATES,
  conditionMet,
  estimateFee,
  getVisibleFields,
  resolveTransactionType,
  type FieldDef,
  type TransferTypeDef,
  type VariantDef,
} from "@/lib/transfer-forms/schema";
import {
  applyMask,
  displayMask,
  fmtMoney,
  maskTail,
  validateValue,
  type Values,
} from "@/lib/transfer-forms/validators";
import { LiveStatusBadge } from "./LiveStatus";

export interface PortalAccount {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

type Phase = "form" | "review" | "confirm" | "done";
type Lookup = { status: "idle" | "loading" | "found" | "notfound"; maskedName?: string; isOwn?: boolean };

const accountLabel = (a: PortalAccount) =>
  `${a.accountType.charAt(0) + a.accountType.slice(1).toLowerCase()} ••••${a.accountNumber.slice(-4)}`;

const defaultsFor = (variant: VariantDef | null) => {
  const out: Values = {};
  variant?.fields.forEach((f) => {
    if (f.defaultValue) out[f.name] = f.defaultValue;
  });
  return out;
};

interface Props {
  type: TransferTypeDef;
  gate: string | null;
  onGateChange: (gate: string | null) => void;
  accounts: PortalAccount[];
  /** Per-transfer limits coming from TransferMethodConfig (admin-controlled). */
  limitOverrides?: Record<string, number>;
  onSubmitted?: () => void;
}

export function TransferFormEngine({ type, gate, onGateChange, accounts, limitOverrides = {}, onSubmitted }: Props) {
  const variant = gate ? type.variants[gate] ?? null : null;
  const [values, setValues] = React.useState<Values>(() => ({ ...defaultsFor(variant) }));
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("form");
  const [step, setStep] = React.useState(0);
  const [pendingGate, setPendingGate] = React.useState<string | null | undefined>(undefined);
  const [pin, setPin] = React.useState("");
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ reference: string; status: string } | null>(null);
  const [lookup, setLookup] = React.useState<Lookup>({ status: "idle" });
  const idemKey = React.useRef<string>("");
  const topRef = React.useRef<HTMLDivElement>(null);

  if (!idemKey.current) idemKey.current = crypto.randomUUID();

  // When the gate changes from the outside (URL/back button) reset the values.
  const lastGate = React.useRef(gate);
  React.useEffect(() => {
    if (lastGate.current !== gate) {
      lastGate.current = gate;
      setValues((prev) => ({
        ...defaultsFor(gate ? type.variants[gate] ?? null : null),
        ...(prev.fromAccountId ? { fromAccountId: prev.fromAccountId } : {}),
      }));
      setTouched({});
      setAttempted(false);
      setPhase("form");
      setStep(0);
      setLookup({ status: "idle" });
    }
  }, [gate, type]);

  const allValues: Values = React.useMemo(() => (gate ? { ...values, [type.gate.name]: gate } : values), [values, gate, type]);
  const visible = React.useMemo(
    () => (variant ? getVisibleFields(variant.fields, allValues) : []),
    [variant, allValues],
  );

  const selectedAccount = accounts.find((a) => a.id === values.fromAccountId);
  const txType = variant ? resolveTransactionType(variant, allValues) : "";
  const limit = variant ? limitOverrides[variant.methodId] ?? variant.perTransferLimit : 0;

  /* -------------------------- account lookup effect -------------------------- */
  const lookupField = visible.find((f) => f.type === "account-lookup");
  const lookupValue = lookupField ? values[lookupField.name] ?? "" : "";
  React.useEffect(() => {
    if (!lookupField) return;
    if (!/^\d{6,17}$/.test(lookupValue)) {
      setLookup({ status: "idle" });
      return;
    }
    setLookup({ status: "loading" });
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await lookupInternalAccount(lookupValue);
        if (cancelled) return;
        setLookup(res.found ? { status: "found", maskedName: res.maskedName, isOwn: res.isOwn } : { status: "notfound" });
      } catch {
        if (!cancelled) setLookup({ status: "notfound" });
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [lookupField, lookupValue]);

  /* -------------------------------- validation -------------------------------- */
  const validateField = React.useCallback(
    (f: FieldDef): string | null => {
      if (f.type === "notice") return null;
      if (f.type === "checkbox") {
        return f.required === false || values[f.name] === "true" ? null : "Please confirm to continue.";
      }
      const v = (values[f.name] ?? "").trim();
      if (!v) {
        if (f.required === false) return null;
        return f.type === "radio" || f.type === "select" || f.type === "account-select"
          ? "Please make a selection."
          : "This field is required.";
      }
      if (f.confirmOf && v !== (values[f.confirmOf] ?? "").trim()) return "The two entries do not match.";
      if (f.type === "account-select" && f.excludeFrom && values[f.excludeFrom] === v)
        return "Choose a different account from the source.";
      if (f.validate) {
        const err = validateValue(f.validate, v, {
          values: allValues,
          max: f.validate === "amount" ? limit : undefined,
          balance: f.validate === "amount" && txType !== "CRYPTO_DEPOSIT" ? selectedAccount?.balance : undefined,
        });
        if (err) return err;
      }
      if (f.type === "account-lookup") {
        if (lookup.status === "loading") return "Checking the account…";
        if (lookup.status !== "found") return "We could not find an active account with this number.";
        if (lookup.isOwn) return "This is one of your own accounts. Use “My own accounts” instead.";
        if (values.payeeConfirmed !== "true") return "Confirm the account holder's name to continue.";
      }
      return null;
    },
    [values, allValues, limit, txType, selectedAccount, lookup],
  );

  const errors = React.useMemo(() => {
    const out: Record<string, string> = {};
    visible.forEach((f) => {
      const e = validateField(f);
      if (e) out[f.name] = e;
    });
    return out;
  }, [visible, validateField]);

  const gateComplete = visible.length === (variant?.fields.filter((f) => conditionMet(f.showIf, allValues)).length ?? 0);
  const showError = (name: string) => (attempted || touched[name] ? errors[name] : undefined);

  /* ---------------------------------- handlers ---------------------------------- */
  const hasEnteredData = Object.entries(values).some(
    ([k, v]) => v && k !== "fromAccountId" && v !== defaultsFor(variant)[k],
  );

  const requestGateChange = (next: string) => {
    if (next === gate) return;
    if (hasEnteredData) setPendingGate(next);
    else onGateChange(next);
  };

  const setValue = (name: string, raw: string, f?: FieldDef) => {
    const v = f?.mask ? applyMask(f.mask, raw) : raw;
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      if (f?.type === "account-lookup") next.payeeConfirmed = "";
      return next;
    });
  };

  const goReview = () => {
    setAttempted(true);
    const keys = Object.keys(errors);
    if (!gateComplete || keys.length) {
      const first = keys[0];
      if (first) document.getElementById(`tf-${first}`)?.focus();
      return;
    }
    setPhase("review");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const submit = async () => {
    if (!variant) return;
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("Enter your 4 to 6 digit Transaction PIN.");
      return;
    }
    setPinError(null);
    setSubmitError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      const memo = allValues.memo || allValues.note || `${variant.label} transfer`;
      visible.forEach((f) => {
        if (f.type === "notice" || f.confirmOf) return;
        if (["fromAccountId", "amount"].includes(f.name)) return;
        fd.append(f.name, allValues[f.name] ?? "");
      });
      fd.append(type.gate.name, gate ?? "");
      fd.append("transferTypeId", type.id);
      fd.append("variant", gate ?? "");
      fd.append("methodId", variant.methodId);
      fd.append("transactionType", txType);
      fd.append("amount", values.amount);
      fd.append("fromAccountId", values.fromAccountId);
      fd.append("description", memo);
      fd.append("pinCode", pin);
      fd.append("idempotencyKey", idemKey.current);
      fd.append("estimatedFee", String(estimateFee(variant, allValues, parseFloat(values.amount) || 0)));
      if (lookup.status === "found" && lookup.maskedName) fd.append("recipientNameMasked", lookup.maskedName);

      const res = await submitTransfer(fd);
      if (!res.success) {
        if (res.field === "pinCode") setPinError(res.error);
        else setSubmitError(res.error);
        return;
      }
      setResult({ reference: res.reference, status: res.status });
      setPhase("done");
      onSubmitted?.();
    } catch {
      setSubmitError("We could not submit this request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues({ ...defaultsFor(variant), ...(values.fromAccountId ? { fromAccountId: values.fromAccountId } : {}) });
    setTouched({});
    setAttempted(false);
    setPin("");
    setResult(null);
    setPhase("form");
    setStep(0);
    setLookup({ status: "idle" });
    idemKey.current = crypto.randomUUID();
    onGateChange(null);
  };

  /* ---------------------------------- render ---------------------------------- */
  const amount = parseFloat(values.amount) || 0;
  const fee = variant ? estimateFee(variant, allValues, amount) : 0;

  if (phase === "done" && result && variant) {
    return (
      <div ref={topRef} className="space-y-5" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-success-bg text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-h3 text-ink-900">Request submitted</h3>
            <p className="text-small text-ink-500">
              Your transfer is waiting for approval. This page updates by itself when its status changes.
            </p>
          </div>
        </div>
        <dl className="divide-y divide-paper-200 rounded border border-paper-300 bg-paper-50 text-small">
          <Row k="Reference" v={<span className="font-mono">{result.reference}</span>} />
          <Row k="Status" v={<LiveStatusBadge reference={result.reference} initialStatus={result.status} />} />
          <Row k="Method" v={`${type.title} · ${variant.label}`} />
          <Row k="Amount" v={fmtMoney(amount)} />
        </dl>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>Start another transfer</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/activities")}>
            View in Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="space-y-6">
      {/* FIRST QUESTION */}
      <fieldset className="space-y-3">
        <legend className="font-display text-base font-semibold text-ink-900">{type.gate.label}</legend>
        {type.gate.help && <p className="text-xs text-ink-500">{type.gate.help}</p>}
        <div
          role="radiogroup"
          aria-label={type.gate.label}
          className={cn("grid gap-3", type.gate.options.length > 2 ? "sm:grid-cols-2" : "sm:grid-cols-2")}
        >
          {type.gate.options.map((o) => (
            <SelectorCard
              key={o.value}
              role="radio"
              title={o.label}
              description={o.description}
              selected={gate === o.value}
              disabled={phase !== "form" && phase !== "review"}
              onClick={() => requestGateChange(o.value)}
            />
          ))}
        </div>
      </fieldset>

      <AnimatePresence initial={false}>
        {pendingGate && (
          <motion.div
            key="warn"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div role="alertdialog" aria-label="Discard entered details" className="rounded border border-warning bg-warning-bg p-4 text-small text-warning">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-3">
                  <p>Changing this answer will clear the details you have entered, because the form depends on it.</p>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={() => {
                        const next = pendingGate;
                        setPendingGate(undefined);
                        onGateChange(next ?? null);
                      }}
                    >
                      Change and clear
                    </Button>
                    <Button size="small" variant="outline" onClick={() => setPendingGate(undefined)}>
                      Keep my details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GATED FIELDS */}
      {variant && phase === "form" && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            goReview();
          }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-y-5 max-w-md">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.slice(step * 5, (step + 1) * 5).map((f) => (
                <motion.div
                  key={f.name}
                  layout={false}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="-mx-1 px-1 py-0.5"
                  style={{ overflow: "hidden" }}
                >
                  <div>
                    <FieldControl
                      f={f}
                      value={values[f.name] ?? ""}
                      error={showError(f.name)}
                      accounts={accounts}
                      values={allValues}
                      lookup={lookup}
                      limit={limit}
                      fee={fee}
                      amount={amount}
                      onChange={(v) => setValue(f.name, v, f)}
                      onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
                      onPayeeConfirm={(c) => setValue("payeeConfirmed", c ? "true" : "")}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 border-t border-paper-200 pt-5 max-w-md">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-8 shadow-none"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </Button>
            )}
            
            {(step + 1) * 5 < visible.length || !gateComplete ? (
              <Button
                type="button"
                className="rounded-full px-8 shadow-none"
                onClick={() => {
                  setAttempted(true);
                  const currentStepFields = visible.slice(step * 5, (step + 1) * 5);
                  const hasError = currentStepFields.some((f) => errors[f.name]);
                  if (hasError) {
                    const first = currentStepFields.find((f) => errors[f.name])?.name;
                    if (first) document.getElementById(`tf-${first}`)?.focus();
                    return;
                  }
                  setAttempted(false);
                  setStep((s) => s + 1);
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-full px-8 shadow-none bg-ink-900 hover:bg-ink-800 text-white">
                Review Details
              </Button>
            )}
          </div>
        </form>
      )}

      {/* REVIEW */}
      {variant && phase === "review" && (
        <div className="space-y-6 max-w-2xl">
          <h3 className="font-display text-lg font-semibold text-ink-900">Review transfer details</h3>
          <dl className="text-small">
            <Row k="Method" v={`${type.title} · ${variant.label}`} />
            {visible
              .filter((f) => f.type !== "notice" && !f.confirmOf)
              .map((f) => (
                <Row key={f.name} k={f.label} v={reviewValue(f, allValues, accounts, lookup)} />
              ))}
            <Row k="Estimated fee (demo)" v={fmtMoney(fee)} />
            <Row
              k={txType === "CRYPTO_DEPOSIT" ? "You will receive" : "Total debit"}
              v={<span>{fmtMoney(txType === "CRYPTO_DEPOSIT" ? amount - fee : amount + fee)}</span>}
            />
            {values.currency && values.currency !== "USD" && (
              <Row
                k="Beneficiary receives (indicative)"
                v={`≈ ${(amount * (DEMO_RATES[values.currency] ?? 1)).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${values.currency}`}
              />
            )}
          </dl>
          
          <div className="text-[10px] text-ink-500 space-y-3 leading-relaxed py-2">
            <p>Please make sure there are sufficient funds in the account from which you are transferring money in order to avoid a possible fee. For details, refer to your account agreement and applicable fee schedule.</p>
            <p>Transfers made after the 10:45 p.m. ET daily cutoff time but before 11:59 p.m. ET will be posted as of the next business day in your transaction history, but will be included in the balance we use to pay transactions that night. Immediate access to these funds is available at ATMs and financial centers. For additional details, see the Online Banking Service Agreement.</p>
            <p>Once you make an immediate transfer, you can't modify or cancel it.</p>
            <p>Transfer and posting dates are based on Eastern Time.</p>
          </div>

          <div className="flex flex-wrap justify-start gap-3 items-center">
            <Button onClick={() => setPhase("confirm")} className="rounded-full px-8 shadow-none bg-ink-900 hover:bg-ink-800 text-white">Transfer</Button>
            <Button variant="outline" onClick={() => setPhase("form")} className="rounded-full px-8 shadow-none border-ink-900 text-ink-900 hover:bg-ink-50">
              Edit
            </Button>
            <Button variant="outline" onClick={reset} className="rounded-full px-8 shadow-none bg-transparent border-transparent text-ink-600 hover:bg-paper-100">Cancel</Button>
          </div>
        </div>
      )}

      {/* PIN CONFIRM */}
      {variant && phase === "confirm" && (
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-base font-semibold text-ink-900">Confirm with your PIN</h3>
            <p className="text-small text-ink-500">
              Sending {fmtMoney(amount)} via {variant.label}. Enter your Transaction PIN to submit this request for approval.
            </p>
          </div>
          <div className="max-w-xs space-y-1.5">
            <label htmlFor="tf-pin" className="block text-small font-medium text-ink-900">
              Transaction PIN
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                id="tf-pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setPinError(null);
                }}
                aria-invalid={!!pinError}
                aria-describedby={pinError ? "tf-pin-err" : undefined}
                className={cn(inputClass(!!pinError), "pl-9 text-center font-mono tracking-[0.4em]")}
                placeholder="••••"
              />
            </div>
            {pinError && (
              <p id="tf-pin-err" className="text-xs text-vermilion-600">
                {pinError}
              </p>
            )}
          </div>
          {submitError && (
            <p role="alert" className="rounded border border-error bg-error-bg p-3 text-small text-error">
              {submitError}
            </p>
          )}
          <div className="flex flex-wrap justify-start gap-3 items-center pt-2">
            <Button onClick={submit} loading={submitting} className="rounded-full px-8 shadow-none bg-ink-900 hover:bg-ink-800 text-white">
              Submit request
            </Button>
            <Button variant="outline" onClick={() => setPhase("review")} disabled={submitting} className="rounded-full px-8 shadow-none border-ink-900 text-ink-900 hover:bg-ink-50">
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- helpers ---------------------------------- */

const isWide = (f: FieldDef) =>
  ["radio", "textarea", "notice", "checkbox", "account-lookup"].includes(f.type) ||
  f.name === "memo" ||
  f.name === "note";

const inputClass = (invalid: boolean) =>
  cn(
    "w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none transition-shadow",
    "focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900",
    invalid ? "border-vermilion-600" : "border-paper-300",
  );

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-paper-200 last:border-0 text-small">
      <dt className="text-ink-600 w-32 shrink-0 pt-0.5">{k}</dt>
      <dd className="text-ink-900 font-semibold break-words flex-1">{v}</dd>
    </div>
  );
}

function reviewValue(f: FieldDef, values: Values, accounts: PortalAccount[], lookup: Lookup): React.ReactNode {
  const v = values[f.name] ?? "";
  if (f.type === "checkbox") return v === "true" ? "Acknowledged" : "No";
  if (!v) return <span className="text-ink-500">Not provided</span>;
  if (f.type === "account-select") {
    const a = accounts.find((x) => x.id === v);
    return a ? accountLabel(a) : v;
  }
  if (f.type === "account-lookup")
    return `••••${v.slice(-4)}${lookup.maskedName ? ` · ${lookup.maskedName}` : ""}`;
  if (f.options) return f.options.find((o) => o.value === v)?.label ?? v;
  if (f.type === "amount") return fmtMoney(parseFloat(v));
  if (f.sensitive) return maskTail(v);
  return displayMask(f.mask, v);
}

interface ControlProps {
  f: FieldDef;
  value: string;
  error?: string;
  accounts: PortalAccount[];
  values: Values;
  lookup: Lookup;
  limit: number;
  fee: number;
  amount: number;
  onChange: (v: string) => void;
  onBlur: () => void;
  onPayeeConfirm: (checked: boolean) => void;
}

function FieldControl({ f, value, error, accounts, values, lookup, limit, fee, amount, onChange, onBlur, onPayeeConfirm }: ControlProps) {
  const id = `tf-${f.name}`;
  const errId = `${id}-err`;
  const helpId = `${id}-help`;
  const describedBy = [error ? errId : null, f.help ? helpId : null].filter(Boolean).join(" ") || undefined;
  const optionalTag = f.required === false && f.type !== "checkbox" && f.type !== "notice";

  if (f.type === "notice") {
    return (
      <div role="note" className="rounded border border-info bg-info-bg p-3 text-small text-info break-all">
        <strong className="block text-[11px] uppercase tracking-wider">{f.label}</strong>
        {f.content}
      </div>
    );
  }

  if (f.type === "checkbox") {
    return (
      <div>
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded border border-paper-300 bg-paper-50 p-3 text-small text-ink-700">
          <input
            id={id}
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "")}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="mt-0.5 h-4 w-4 accent-[#1F4D3F]"
          />
          <span>{f.content}</span>
        </label>
        {error && (
          <p id={errId} className="mt-1 text-xs text-vermilion-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  const label = (
    <label htmlFor={id} className="block text-small font-medium text-ink-900">
      {f.label}
      {optionalTag && <span className="ml-1 text-xs font-normal text-ink-500">(optional)</span>}
    </label>
  );

  const footer = (
    <>
      {f.help && !error && (
        <p id={helpId} className="text-xs text-ink-500">
          {f.help}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-xs text-vermilion-600">
          {error}
        </p>
      )}
    </>
  );

  if (f.type === "radio") {
    return (
      <div className="space-y-1.5">
        <span id={id} className="block text-small font-medium text-ink-900">
          {f.label}
        </span>
        <div role="radiogroup" aria-labelledby={id} className="grid gap-3 sm:grid-cols-2">
          {f.options?.map((o) => (
            <SelectorCard
              key={o.value}
              role="radio"
              title={o.label}
              description={o.description}
              selected={value === o.value}
              onClick={() => {
                onChange(o.value);
                onBlur();
              }}
            />
          ))}
        </div>
        {footer}
      </div>
    );
  }

  if (f.type === "account-select") {
    const list = accounts.filter((a) => !(f.excludeFrom && values[f.excludeFrom] === a.id));
    const selected = accounts.find((a) => a.id === value);
    return (
      <div className="space-y-1.5">
        {label}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={inputClass(!!error)}
        >
          <option value="">Select an account</option>
          {list.map((a) => (
            <option key={a.id} value={a.id}>
              {accountLabel(a)} · {fmtMoney(a.balance, a.currency)}
            </option>
          ))}
        </select>
        {selected && !error && <p className="text-xs text-ink-500">Available balance {fmtMoney(selected.balance, selected.currency)}</p>}
        {footer}
      </div>
    );
  }

  if (f.type === "select") {
    return (
      <div className="space-y-1.5">
        {label}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={inputClass(!!error)}
        >
          <option value="">Select</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {footer}
      </div>
    );
  }

  if (f.type === "textarea") {
    return (
      <div className="space-y-1.5">
        {label}
        <textarea
          id={id}
          value={value}
          maxLength={f.maxLength}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          rows={3}
          className={cn(inputClass(!!error), "h-auto py-3")}
        />
        {footer}
      </div>
    );
  }

  // text | amount | date | account-lookup
  const shown = f.mask ? displayMask(f.mask, value) : value;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-1.5">
      {label}
      <div className="relative">
        {f.prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">{f.prefix}</span>}
        <input
          id={id}
          type={f.type === "date" ? "date" : "text"}
          min={f.type === "date" ? today : undefined}
          inputMode={f.type === "amount" || f.mask?.startsWith("digits") ? "numeric" : undefined}
          autoComplete="off"
          value={shown}
          maxLength={f.maxLength && !f.mask ? f.maxLength : undefined}
          placeholder={f.placeholder}
          onChange={(e) => onChange(f.mask === "iban" ? e.target.value : e.target.value)}
          onBlur={onBlur}
          onPaste={f.confirmOf ? (e) => e.preventDefault() : undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(inputClass(!!error), f.prefix && "pl-7", (f.type === "amount" || f.mask?.startsWith("digits")) && "font-mono tabular-nums")}
        />
      </div>
      {f.maxLength && f.type === "text" && !f.mask && value.length > f.maxLength * 0.7 && (
        <p className="text-right text-[11px] text-ink-500">
          {value.length}/{f.maxLength}
        </p>
      )}
      {f.type === "amount" && f.stableEstimate && amount > 0 && (
        <p className="text-xs text-ink-700">
          ≈ {(Math.max(amount - fee, 0)).toLocaleString("en-US", { maximumFractionDigits: 2 })} {(values.asset || "").toUpperCase()} after estimated fees of {fmtMoney(fee)} (demo estimate, 1:1 peg)
        </p>
      )}
      {f.type === "amount" && limit > 0 && !error && <p className="text-xs text-ink-500">Limit per transfer: {fmtMoney(limit)} (demo)</p>}
      {f.type === "account-lookup" && (
        <div aria-live="polite" className="space-y-2">
          {lookup.status === "loading" && <p className="text-xs text-ink-500">Checking account…</p>}
          {lookup.status === "notfound" && <p className="text-xs text-vermilion-600">No active account found with this number.</p>}
          {lookup.status === "found" && (
            <label className="flex cursor-pointer items-start gap-2 rounded border border-pine-700/40 bg-success-bg p-3 text-small text-ink-900">
              <input
                type="checkbox"
                checked={values.payeeConfirmed === "true"}
                onChange={(e) => onPayeeConfirm(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1F4D3F]"
              />
              <span>
                Account holder: <strong>{lookup.maskedName}</strong>. I confirm this is the right person.
              </span>
            </label>
          )}
        </div>
      )}
      {footer}
    </div>
  );
}
