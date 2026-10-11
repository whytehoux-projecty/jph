"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  BookUser,
  UserPlus,
  RefreshCw,
  Building2,
  ChevronRight,
  Info,
  Globe2,
  ArrowRightLeft,
  Wallet,
  Smartphone,
} from "lucide-react";
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
import {
  BeneficiaryPopoutPanel,
  type SelectedBeneficiaryData,
} from "./BeneficiaryPopoutPanel";
import { getRailForMethod } from "@/lib/beneficiary-rails";
import { BrandIcon, getBrandIconSrc } from "@/components/ui/BrandIcon";

export const getGateIcon = (val: string) => {
  if (getBrandIconSrc(val)) {
    return <BrandIcon name={val} size={24} />;
  }
  switch (val) {
    case "ach":
    case "wire_domestic":
      return <Building2 className="h-5 w-5" />;
    case "wire_international":
      return <Globe2 className="h-5 w-5" />;
    case "fednow":
    case "own":
      return <ArrowRightLeft className="h-5 w-5" />;
    case "other":
      return <BookUser className="h-5 w-5" />;
    case "usdt":
    case "usdc":
      return <Wallet className="h-5 w-5" />;
    case "zelle":
    case "cashapp":
    case "venmo":
      return <Smartphone className="h-5 w-5" />;
    default:
      return <Building2 className="h-5 w-5" />;
  }
};

export interface PortalAccount {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

type Phase = "form" | "confirm" | "done";
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

export function TransferFormEngine({
  type,
  gate,
  onGateChange,
  accounts,
  limitOverrides = {},
  onSubmitted,
}: Props) {
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

  // Pop-out panel state
  const [isPopoutOpen, setIsPopoutOpen] = React.useState(false);
  const [popoutInitialMode, setPopoutInitialMode] = React.useState<"select" | "add">("select");
  const [selectedBeneficiary, setSelectedBeneficiary] = React.useState<SelectedBeneficiaryData | null>(null);

  if (!idemKey.current) idemKey.current = crypto.randomUUID();

  // When the gate changes from the outside reset values
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
      setSelectedBeneficiary(null);
    }
  }, [gate, type]);

  const allValues: Values = React.useMemo(
    () => (gate ? { ...values, [type.gate.name]: gate } : values),
    [values, gate, type]
  );
  const visible = React.useMemo(
    () => (variant ? getVisibleFields(variant.fields, allValues) : []),
    [variant, allValues]
  );

  const selectedAccount = accounts.find((a) => a.id === values.fromAccountId);
  const txType = variant ? resolveTransactionType(variant, allValues) : "";
  const limit = variant ? limitOverrides[variant.methodId] ?? variant.perTransferLimit : 0;

  // Beneficiary / Recipient flow detection
  const isRecipientFlow = gate !== "own";

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
        setLookup(
          res.found
            ? { status: "found", maskedName: res.maskedName, isOwn: res.isOwn }
            : { status: "notfound" }
        );
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
        return f.required === false || values[f.name] === "true"
          ? null
          : "Please confirm to continue.";
      }
      const v = (values[f.name] ?? "").trim();
      if (!v) {
        if (f.required === false) return null;
        return f.type === "radio" || f.type === "select" || f.type === "account-select"
          ? "Please make a selection."
          : "This field is required.";
      }
      if (f.confirmOf && v !== (values[f.confirmOf] ?? "").trim())
        return "The two entries do not match.";
      if (f.type === "account-select" && f.excludeFrom && values[f.excludeFrom] === v)
        return "Choose a different account from the source.";
      if (f.validate) {
        const err = validateValue(f.validate, v, {
          values: allValues,
          max: f.validate === "amount" ? limit : undefined,
          balance:
            f.validate === "amount" && txType !== "CRYPTO_DEPOSIT"
              ? selectedAccount?.balance
              : undefined,
        });
        if (err) return err;
      }
      if (f.type === "account-lookup") {
        if (lookup.status === "loading") return "Checking the account…";
        if (lookup.status !== "found")
          return "We could not find an active account with this number.";
        if (lookup.isOwn)
          return "This is one of your own accounts. Use “My own accounts” instead.";
        if (values.payeeConfirmed !== "true")
          return "Confirm the account holder's name to continue.";
      }
      return null;
    },
    [values, allValues, limit, txType, selectedAccount, lookup]
  );

  const errors = React.useMemo(() => {
    const out: Record<string, string> = {};
    visible.forEach((f) => {
      const e = validateField(f);
      if (e) out[f.name] = e;
    });
    return out;
  }, [visible, validateField]);

  const showError = (name: string) => (attempted || touched[name] ? errors[name] : undefined);

  /* ---------------------------------- handlers ---------------------------------- */
  const hasEnteredData = Object.entries(values).some(
    ([k, v]) => v && k !== "fromAccountId" && v !== defaultsFor(variant)[k]
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

  // Called when beneficiary is selected or created via pop-out panel
  const handleBeneficiarySelected = (data: SelectedBeneficiaryData) => {
    setSelectedBeneficiary(data);

    // Sync fields into form values
    setValues((prev) => {
      const next = { ...prev };
      next.recipientName = data.name;
      if (data.details.bankName) next.bankName = data.details.bankName;
      if (data.details.routingNumber) next.routingNumber = data.details.routingNumber;
      if (data.details.accountNumber) {
        next.accountNumber = data.details.accountNumber;
        next.accountNumberConfirm = data.details.accountNumber;
        next.toAccountNumber = data.details.accountNumber;
      }
      if (data.details.addressStreet) next.addressStreet = data.details.addressStreet;
      if (data.details.addressCity) next.addressCity = data.details.addressCity;
      if (data.details.addressState) next.addressState = data.details.addressState;
      if (data.details.addressPostal) next.addressPostal = data.details.addressPostal;
      if (data.details.accountType) next.accountType = data.details.accountType;
      if (data.details.swiftBic) next.swiftBic = data.details.swiftBic;
      if (data.details.iban) {
        next.iban = data.details.iban;
        next.ibanConfirm = data.details.iban;
      }
      if (data.details.country) next.country = data.details.country;
      if (data.details.address) {
        next.address = data.details.address;
        next.addressConfirm = data.details.address;
      }
      if (data.details.network) next.network = data.details.network;
      if (data.details.email || data.details.phone) {
        next.zelleIdentifier = data.details.email || data.details.phone;
      }
      if (data.details.cashtag) next.cashtag = data.details.cashtag;
      if (data.details.username) next.venmoUsername = data.details.username;
      if (data.rail === "internal") next.payeeConfirmed = "true";

      return next;
    });
  };

  const clearBeneficiary = () => {
    setSelectedBeneficiary(null);
    setValues((prev) => {
      const next = { ...prev };
      delete next.recipientName;
      delete next.accountNumber;
      delete next.accountNumberConfirm;
      delete next.routingNumber;
      delete next.bankName;
      delete next.addressStreet;
      delete next.addressCity;
      delete next.addressState;
      delete next.addressPostal;
      delete next.swiftBic;
      delete next.iban;
      delete next.ibanConfirm;
      delete next.zelleIdentifier;
      delete next.cashtag;
      delete next.venmoUsername;
      delete next.toAccountNumber;
      delete next.payeeConfirmed;
      return next;
    });
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
      fd.append("amount", values.amount || "0");
      fd.append("fromAccountId", values.fromAccountId || "");
      fd.append("description", memo);
      fd.append("pinCode", pin);
      fd.append("idempotencyKey", idemKey.current);
      fd.append(
        "estimatedFee",
        String(estimateFee(variant, allValues, parseFloat(values.amount) || 0))
      );
      if (lookup.status === "found" && lookup.maskedName)
        fd.append("recipientNameMasked", lookup.maskedName);

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
    setValues({
      ...defaultsFor(variant),
      ...(values.fromAccountId ? { fromAccountId: values.fromAccountId } : {}),
    });
    setTouched({});
    setAttempted(false);
    setPin("");
    setResult(null);
    setPhase("form");
    setStep(0);
    setLookup({ status: "idle" });
    setSelectedBeneficiary(null);
    idemKey.current = crypto.randomUUID();
    onGateChange(null);
  };

  /* ---------------------------------- render ---------------------------------- */
  const amount = parseFloat(values.amount) || 0;
  const fee = variant ? estimateFee(variant, allValues, amount) : 0;

  // Step 1 check: Is beneficiary selected/ready?
  const isBeneficiaryComplete = React.useMemo(() => {
    if (!isRecipientFlow) return !!values.toAccountId;
    if (selectedBeneficiary) return true;
    if (values.recipientName && (values.accountNumber || values.iban || values.zelleIdentifier || values.cashtag || values.venmoUsername || values.toAccountNumber || values.address)) {
      return true;
    }
    return false;
  }, [isRecipientFlow, selectedBeneficiary, values]);

  // Step 2 check: Account and Amount
  const isDetailsComplete = React.useMemo(() => {
    return (
      !!values.fromAccountId &&
      amount > 0 &&
      !errors.amount &&
      !errors.fromAccountId
    );
  }, [values.fromAccountId, amount, errors.amount, errors.fromAccountId]);

  if (phase === "done" && result && variant) {
    return (
      <div ref={topRef} className="space-y-6" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-none bg-success-bg text-success border border-success/30">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-h3 text-ink-900">Request submitted</h3>
            <p className="text-small text-ink-500">
              Your transfer is waiting for approval. This page updates by itself when its status changes.
            </p>
          </div>
        </div>
        <dl className="divide-y divide-paper-200 border border-paper-300 bg-paper-50 text-small rounded-none">
          <Row k="Reference" v={<span className="font-mono">{result.reference}</span>} />
          <Row k="Status" v={<LiveStatusBadge reference={result.reference} initialStatus={result.status} />} />
          <Row k="Method" v={`${type.title} · ${variant.label}`} />
          <Row k="Amount" v={fmtMoney(amount)} />
        </dl>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-none bg-ink-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-ink-800 transition-colors shadow-none"
          >
            Start another transfer
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = "/activities")}
            className="rounded-none border border-paper-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-paper-100 transition-colors shadow-none"
          >
            View in Activities
          </button>
        </div>
      </div>
    );
  }

  // Steps definition for the Stepper
  const stepsList = isRecipientFlow
    ? [
        { title: "Beneficiary", subtitle: "Select or add recipient" },
        { title: "Transfer Details", subtitle: "Amount & account" },
        { title: "Review & Purpose", subtitle: "Notes & confirmation" },
      ]
    : [
        { title: "Accounts", subtitle: "Source & destination" },
        { title: "Amount & Timing", subtitle: "Schedule & notes" },
        { title: "Review", subtitle: "Confirm details" },
      ];

  return (
    <div ref={topRef} className="space-y-6">
      {/* SECTION 1: TRANSFER METHOD / FIRST QUESTION BUTTONS */}
      <fieldset className="space-y-3">
        <legend className="font-display text-base font-semibold text-ink-900">
          {type.gate.label}
        </legend>
        {type.gate.help && <p className="text-xs text-ink-500">{type.gate.help}</p>}
        <div
          role="radiogroup"
          aria-label={type.gate.label}
          className={cn(
            "grid gap-3",
            type.gate.options.length > 2 ? "sm:grid-cols-2" : "sm:grid-cols-2"
          )}
        >
          {type.gate.options.map((o) => (
            <SelectorCard
              key={o.value}
              role="radio"
              icon={getGateIcon(o.value)}
              title={o.label}
              description={o.description}
              selected={gate === o.value}
              disabled={phase !== "form"}
              onClick={() => requestGateChange(o.value)}
              layout="row"
              className="rounded-none"
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
            <div
              role="alertdialog"
              aria-label="Discard entered details"
              className="rounded-none border border-warning bg-warning-bg p-4 text-small text-warning"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-3">
                  <p>
                    Changing this answer will clear the details you have entered, because the form depends on it.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = pendingGate;
                        setPendingGate(undefined);
                        onGateChange(next ?? null);
                      }}
                      className="rounded-none bg-ink-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-ink-800 transition-colors"
                    >
                      Change and clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingGate(undefined)}
                      className="rounded-none border border-paper-300 bg-white px-4 py-1.5 text-xs font-semibold text-ink-700 hover:bg-paper-100 transition-colors"
                    >
                      Keep my details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION DIVIDER BORDER LINE SEPARATING WIRE TRANSFER BUTTONS FROM THE FORM */}
      {variant && (
        <div className="border-t border-paper-300 pt-6 my-6">
          {/* STABLE, FIXED-DIMENSION FORM CONTAINER */}
          <div className="min-h-[460px] flex flex-col justify-between">
            {phase === "form" && (
              <>
                {/* STEPPER HEADER WITH SQUARED-EDGE AESTHETICS */}
                <div className="border-b border-paper-200 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    {stepsList.map((s, idx) => {
                      const isActive = idx === step;
                      const isDone = idx < step;
                      return (
                        <div key={s.title} className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={cn(
                                "text-[11px] font-bold uppercase tracking-wider",
                                isActive
                                  ? "text-ink-900 font-bold"
                                  : isDone
                                  ? "text-pine-700"
                                  : "text-ink-400"
                              )}
                            >
                              {`0${idx + 1}. ${s.title}`}
                            </span>
                            {isDone && <CheckCircle2 className="h-3 w-3 text-pine-700" />}
                          </div>
                          <div
                            className={cn(
                              "h-1 w-full rounded-none transition-colors",
                              isActive
                                ? "bg-ink-900"
                                : isDone
                                ? "bg-pine-700"
                                : "bg-paper-200"
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FORM PAGE 0: RECIPIENT / BENEFICIARY SELECTION */}
                {step === 0 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    {isRecipientFlow ? (
                      /* External / Wire / P2P / Crypto / Internal Other Beneficiary section */
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-display text-base font-bold text-ink-900">
                            Recipient / Beneficiary
                          </h3>
                          <p className="text-xs text-ink-500">
                            Select a saved contact or enter a new beneficiary for this {variant.label}.
                          </p>
                        </div>

                        {!isBeneficiaryComplete ? (
                          /* Minimal structure fitting right in the box */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPopoutInitialMode("select");
                                setIsPopoutOpen(true);
                              }}
                              className="group flex items-center gap-3.5 p-4 rounded-none border border-paper-300 bg-paper-50 hover:border-ink-900 hover:bg-white transition-all text-left"
                            >
                              <div className="h-10 w-10 shrink-0 rounded-none bg-paper-100 flex items-center justify-center text-ink-900 group-hover:bg-ink-900 group-hover:text-white transition-colors">
                                <BookUser className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-display text-small font-bold text-ink-900 block leading-tight">
                                  Select Saved Beneficiary
                                </span>
                                <span className="text-xs text-ink-500 mt-1 block leading-snug">
                                  Choose from your saved contacts for {variant.label}.
                                </span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPopoutInitialMode("add");
                                setIsPopoutOpen(true);
                              }}
                              className="group flex items-center gap-3.5 p-4 rounded-none border border-paper-300 bg-paper-50 hover:border-ink-900 hover:bg-white transition-all text-left"
                            >
                              <div className="h-10 w-10 shrink-0 rounded-none bg-paper-100 flex items-center justify-center text-ink-900 group-hover:bg-ink-900 group-hover:text-white transition-colors">
                                <UserPlus className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-display text-small font-bold text-ink-900 block leading-tight">
                                  Add New Beneficiary
                                </span>
                                <span className="text-xs text-ink-500 mt-1 block leading-snug">
                                  Enter recipient details and optionally save to contacts.
                                </span>
                              </div>
                            </button>
                          </div>
                        ) : (
                          /* Selected Beneficiary Summary Card */
                          <div className="border border-paper-300 bg-white p-5 rounded-none space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3.5">
                                <div className="h-10 w-10 border border-paper-300 bg-paper-50 flex items-center justify-center p-1 shrink-0 rounded-none">
                                  {getGateIcon(gate || "")}
                                </div>
                                <div>
                                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pine-700/10 text-pine-700 rounded-none mb-1">
                                    {selectedBeneficiary?.isSaved ? "Saved Beneficiary" : "Recipient Selected"}
                                  </span>
                                  <h4 className="font-display text-base font-bold text-ink-900">
                                    {selectedBeneficiary?.name || values.recipientName}
                                    {selectedBeneficiary?.nickname && (
                                      <span className="ml-2 text-xs font-normal text-ink-500">
                                        ({selectedBeneficiary.nickname})
                                      </span>
                                    )}
                                  </h4>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPopoutInitialMode("select");
                                    setIsPopoutOpen(true);
                                  }}
                                  className="text-xs font-semibold text-ink-900 hover:underline px-2 py-1 rounded-none border border-paper-300 bg-paper-50 hover:bg-white"
                                >
                                  Change
                                </button>
                                <button
                                  type="button"
                                  onClick={clearBeneficiary}
                                  className="text-xs font-semibold text-vermilion-600 hover:underline px-2 py-1"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <div className="text-xs text-ink-600 font-mono space-y-1 border-t border-paper-200 pt-3">
                              {values.bankName && (
                                <p>Bank: <strong className="text-ink-900">{values.bankName}</strong></p>
                              )}
                              {values.routingNumber && (
                                <p>Routing (ABA): <strong className="text-ink-900">{values.routingNumber}</strong></p>
                              )}
                              {values.accountNumber && (
                                <p>Account: <strong className="text-ink-900">••••{values.accountNumber.slice(-4)}</strong></p>
                              )}
                              {values.swiftBic && (
                                <p>SWIFT/BIC: <strong className="text-ink-900">{values.swiftBic}</strong></p>
                              )}
                              {values.iban && (
                                <p>IBAN: <strong className="text-ink-900">{values.iban}</strong></p>
                              )}
                              {values.zelleIdentifier && (
                                <p>Zelle Contact: <strong className="text-ink-900">{values.zelleIdentifier}</strong></p>
                              )}
                              {values.cashtag && (
                                <p>Cashtag: <strong className="text-ink-900">{values.cashtag}</strong></p>
                              )}
                              {values.venmoUsername && (
                                <p>Venmo: <strong className="text-ink-900">@{values.venmoUsername.replace(/^@/, "")}</strong></p>
                              )}
                              {values.address && (
                                <p>Wallet Address: <strong className="text-ink-900">{values.address}</strong></p>
                              )}
                              {values.toAccountNumber && (
                                <p>Internal Account: <strong className="text-ink-900">••••{values.toAccountNumber.slice(-4)}</strong></p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Own accounts Step 0: destination account */
                      <div className="space-y-4 max-w-md">
                        <div className="space-y-1">
                          <h3 className="font-display text-base font-bold text-ink-900">
                            Destination Account
                          </h3>
                          <p className="text-xs text-ink-500">
                            Choose which of your own accounts receives the funds.
                          </p>
                        </div>
                        {visible
                          .filter((f) => f.name === "toAccountId")
                          .map((f) => (
                            <FieldControl
                              key={f.name}
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
                              onPayeeConfirm={() => {}}
                            />
                          ))}
                      </div>
                    )}

                    {/* Step 0 Navigation Footer */}
                    <div className="border-t border-paper-200 pt-5 mt-auto flex items-center justify-between">
                      <span className="text-xs text-ink-500">
                        {!isBeneficiaryComplete && "Select or add a beneficiary to proceed"}
                      </span>
                      <button
                        type="button"
                        disabled={!isBeneficiaryComplete}
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-2 rounded-none bg-ink-900 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-ink-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-none"
                      >
                        Next: Transfer Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* FORM PAGE 1: TRANSFER DETAILS (ACCOUNT & AMOUNT) */}
                {step === 1 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-5 max-w-md">
                      <div className="space-y-1">
                        <h3 className="font-display text-base font-bold text-ink-900">
                          Transfer Details
                        </h3>
                        <p className="text-xs text-ink-500">
                          Select source account and enter transfer amount.
                        </p>
                      </div>

                      {visible
                        .filter((f) =>
                          ["fromAccountId", "amount", "speed", "currency", "entryClass", "network"].includes(
                            f.name
                          )
                        )
                        .map((f) => (
                          <FieldControl
                            key={f.name}
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
                            onPayeeConfirm={() => {}}
                          />
                        ))}
                    </div>

                    {/* Step 1 Navigation Footer with Squared-Edge Aesthetics */}
                    <div className="border-t border-paper-200 pt-5 mt-auto flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="inline-flex items-center gap-2 rounded-none border border-paper-300 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-paper-100 transition-colors shadow-none"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={!isDetailsComplete}
                        onClick={() => {
                          setAttempted(true);
                          if (isDetailsComplete) setStep(2);
                        }}
                        className="inline-flex items-center gap-2 rounded-none bg-ink-900 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-ink-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-none"
                      >
                        Next: Review Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* FORM PAGE 2: ADDITIONAL DETAILS & REVIEW */}
                {step === 2 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-5 max-w-xl">
                      <div className="space-y-1">
                        <h3 className="font-display text-base font-bold text-ink-900">
                          Additional Details & Review
                        </h3>
                        <p className="text-xs text-ink-500">
                          Confirm transfer details and add any optional notes.
                        </p>
                      </div>

                      {/* Purpose & Memo & Timing fields */}
                      <div className="space-y-4">
                        {visible
                          .filter((f) =>
                            [
                              "purpose",
                              "memo",
                              "note",
                              "timing",
                              "scheduledDate",
                              "chargeBearer",
                            ].includes(f.name)
                          )
                          .map((f) => (
                            <FieldControl
                              key={f.name}
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
                              onPayeeConfirm={() => {}}
                            />
                          ))}
                      </div>

                      {/* Acknowledgements */}
                      <div className="space-y-3">
                        {visible
                          .filter((f) => f.type === "checkbox")
                          .map((f) => (
                            <FieldControl
                              key={f.name}
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
                              onPayeeConfirm={() => {}}
                            />
                          ))}
                      </div>

                      {/* Compact Summary Review Table */}
                      <div className="border border-paper-300 bg-paper-50 p-4 rounded-none text-small space-y-2">
                        <div className="flex justify-between border-b border-paper-200 pb-2 items-center">
                          <span className="text-ink-500">Method</span>
                          <span className="font-semibold text-ink-900 flex items-center gap-2">
                            {gate && <span className="shrink-0 inline-flex items-center justify-center text-ink-700">{getGateIcon(gate)}</span>}
                            {variant.label}
                          </span>
                        </div>
                        {isRecipientFlow && (
                          <div className="flex justify-between border-b border-paper-200 pb-2 items-center">
                            <span className="text-ink-500">Recipient</span>
                            <span className="font-semibold text-ink-900 flex items-center gap-2">
                              {gate && <span className="shrink-0 inline-flex items-center justify-center text-ink-700">{getGateIcon(gate)}</span>}
                              {selectedBeneficiary?.name || values.recipientName}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-b border-paper-200 pb-2">
                          <span className="text-ink-500">From Account</span>
                          <span className="font-semibold text-ink-900">
                            {selectedAccount ? accountLabel(selectedAccount) : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-paper-200 pb-2">
                          <span className="text-ink-500">Transfer Amount</span>
                          <span className="font-semibold text-ink-900">{fmtMoney(amount)}</span>
                        </div>
                        <div className="flex justify-between border-b border-paper-200 pb-2">
                          <span className="text-ink-500">Estimated Fee</span>
                          <span className="font-semibold text-ink-900">{fmtMoney(fee)}</span>
                        </div>
                        <div className="flex justify-between pt-1 font-bold text-ink-900">
                          <span>Total Debit</span>
                          <span>{fmtMoney(amount + fee)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 Navigation Footer with Squared-Edge Aesthetics */}
                    <div className="border-t border-paper-200 pt-5 mt-auto flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-2 rounded-none border border-paper-300 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-paper-100 transition-colors shadow-none"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAttempted(true);
                          const ackErrors = visible
                            .filter((f) => f.type === "checkbox")
                            .some((f) => errors[f.name]);
                          if (!ackErrors) setPhase("confirm");
                        }}
                        className="inline-flex items-center gap-2 rounded-none bg-ink-900 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-ink-800 transition-colors shadow-none"
                      >
                        Continue to PIN
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PIN CONFIRM PHASE */}
            {variant && phase === "confirm" && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-5 max-w-sm">
                  <div>
                    <h3 className="font-display text-base font-bold text-ink-900">
                      Confirm with Transaction PIN
                    </h3>
                    <p className="text-small text-ink-500 mt-1">
                      Sending {fmtMoney(amount)} via {variant.label}. Enter your 4-6 digit PIN to submit.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="tf-pin" className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
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
                        className={cn(
                          inputClass(!!pinError),
                          "pl-9 text-center font-mono tracking-[0.4em] rounded-none"
                        )}
                        placeholder="••••"
                      />
                    </div>
                    {pinError && <p className="text-xs text-vermilion-600">{pinError}</p>}
                  </div>
                  {submitError && (
                    <div className="rounded-none border border-error bg-error-bg p-3 text-small text-error">
                      {submitError}
                    </div>
                  )}
                </div>

                {/* PIN Phase Navigation Footer with Squared-Edge Aesthetics */}
                <div className="border-t border-paper-200 pt-5 mt-auto flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPhase("form")}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-none border border-paper-300 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-paper-100 transition-colors shadow-none"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Review
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || pin.length < 4}
                    className="inline-flex items-center gap-2 rounded-none bg-ink-900 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-ink-800 transition-colors shadow-none disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit Request"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BENEFICIARY POP-OUT PANEL */}
      {gate && (
        <BeneficiaryPopoutPanel
          isOpen={isPopoutOpen}
          onClose={() => setIsPopoutOpen(false)}
          methodId={gate}
          methodLabel={variant?.label || type.title}
          initialMode={popoutInitialMode}
          onSelectBeneficiary={handleBeneficiarySelected}
        />
      )}
    </div>
  );
}

/* ---------------------------------- helpers ---------------------------------- */

const inputClass = (invalid: boolean) =>
  cn(
    "w-full h-12 rounded-none border bg-paper-50 px-3 text-body outline-none transition-shadow",
    "focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900",
    invalid ? "border-vermilion-600" : "border-paper-300"
  );

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 px-4 border-b border-paper-200 last:border-0 text-small">
      <dt className="text-ink-600 w-32 shrink-0 pt-0.5">{k}</dt>
      <dd className="text-ink-900 font-semibold break-words flex-1">{v}</dd>
    </div>
  );
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

function FieldControl({
  f,
  value,
  error,
  accounts,
  values,
  lookup,
  limit,
  fee,
  amount,
  onChange,
  onBlur,
  onPayeeConfirm,
}: ControlProps) {
  const id = `tf-${f.name}`;
  const errId = `${id}-err`;
  const helpId = `${id}-help`;
  const describedBy = [error ? errId : null, f.help ? helpId : null].filter(Boolean).join(" ") || undefined;
  const optionalTag = f.required === false && f.type !== "checkbox" && f.type !== "notice";

  if (f.type === "notice") {
    return (
      <div role="note" className="rounded-none border border-info bg-info-bg p-3 text-small text-info break-all">
        <strong className="block text-[11px] uppercase tracking-wider">{f.label}</strong>
        {f.content}
      </div>
    );
  }

  if (f.type === "checkbox") {
    return (
      <div>
        <label
          htmlFor={id}
          className="flex cursor-pointer items-start gap-3 rounded-none border border-paper-300 bg-paper-50 p-3 text-small text-ink-700 hover:border-ink-900 transition-colors"
        >
          <input
            id={id}
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "")}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="mt-0.5 h-4 w-4 rounded-none accent-pine-700"
          />
          <span className="text-xs leading-relaxed">{f.content}</span>
        </label>
        {error && <p id={errId} className="mt-1 text-xs text-vermilion-600">{error}</p>}
      </div>
    );
  }

  const label = (
    <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
      {f.label}
      {optionalTag && <span className="ml-1 text-xs font-normal text-ink-500">(optional)</span>}
    </label>
  );

  const footer = (
    <>
      {f.help && !error && <p id={helpId} className="text-xs text-ink-500">{f.help}</p>}
      {error && <p id={errId} role="alert" className="text-xs text-vermilion-600">{error}</p>}
    </>
  );

  if (f.type === "radio") {
    return (
      <div className="space-y-1.5">
        <span id={id} className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
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
              layout="row"
              className="rounded-none"
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
        {selected && !error && (
          <p className="text-xs text-ink-500">
            Available balance: {fmtMoney(selected.balance, selected.currency)}
          </p>
        )}
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
          <option value="">Select option</option>
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
          className={cn(inputClass(!!error), "h-auto py-3 rounded-none")}
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
        {f.prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
            {f.prefix}
          </span>
        )}
        <input
          id={id}
          type={f.type === "date" ? "date" : "text"}
          min={f.type === "date" ? today : undefined}
          inputMode={f.type === "amount" || f.mask?.startsWith("digits") ? "numeric" : undefined}
          autoComplete="off"
          value={shown}
          maxLength={f.maxLength && !f.mask ? f.maxLength : undefined}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onPaste={f.confirmOf ? (e) => e.preventDefault() : undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            inputClass(!!error),
            f.prefix && "pl-7",
            (f.type === "amount" || f.mask?.startsWith("digits")) && "font-mono tabular-nums"
          )}
        />
      </div>
      {f.maxLength && f.type === "text" && !f.mask && value.length > f.maxLength * 0.7 && (
        <p className="text-right text-[11px] text-ink-500">
          {value.length}/{f.maxLength}
        </p>
      )}
      {f.type === "amount" && f.stableEstimate && amount > 0 && (
        <p className="text-xs text-ink-700">
          ≈ {Math.max(amount - fee, 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
          {(values.asset || "").toUpperCase()} after estimated fees of {fmtMoney(fee)} (demo estimate)
        </p>
      )}
      {f.type === "amount" && limit > 0 && !error && (
        <p className="text-xs text-ink-500">Limit per transfer: {fmtMoney(limit)} (demo)</p>
      )}
      {f.type === "account-lookup" && (
        <div aria-live="polite" className="space-y-2">
          {lookup.status === "loading" && <p className="text-xs text-ink-500">Checking account…</p>}
          {lookup.status === "notfound" && (
            <p className="text-xs text-vermilion-600">No active account found with this number.</p>
          )}
          {lookup.status === "found" && (
            <label className="flex cursor-pointer items-start gap-2 rounded-none border border-pine-700/40 bg-success-bg p-3 text-small text-ink-900">
              <input
                type="checkbox"
                checked={values.payeeConfirmed === "true"}
                onChange={(e) => onPayeeConfirm(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-none accent-pine-700"
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
