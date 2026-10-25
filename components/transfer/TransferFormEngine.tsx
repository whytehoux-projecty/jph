"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  BookUser,
  Building2,
  CheckCircle2,
  Globe2,
  Smartphone,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/alert";
import { Stepper } from "@/components/ui/stepper";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatAmount, maskAccountNumber } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { lookupInternalAccount, submitTransfer } from "@/app/actions/transfer";
import {
  getVisibleFields,
  resolveTransactionType,
  type FieldDef,
  type TransferTypeDef,
  type VariantDef,
} from "@/lib/transfer-forms/schema";
import { applyMask, displayMask, validateValue, type Values } from "@/lib/transfer-forms/validators";
import { LiveStatusBadge } from "./LiveStatus";
import { BackButton, ChoiceCards, ReviewList, StepFooter, StepHeading } from "@/components/portal/flow";
import {
  BeneficiaryPopoutPanel,
  type SelectedBeneficiaryData,
} from "./BeneficiaryPopoutPanel";
import { BrandIcon, getBrandIconSrc } from "@/components/ui/BrandIcon";

export const getGateIcon = (val: string) => {
  if (getBrandIconSrc(val)) {
    return <BrandIcon name={val} size={20} alt="" />;
  }
  switch (val) {
    case "ach":
    case "wire_domestic":
      return <Building2 className="size-5" aria-hidden="true" />;
    case "wire_international":
      return <Globe2 className="size-5" aria-hidden="true" />;
    case "fednow":
    case "own":
      return <ArrowRightLeft className="size-5" aria-hidden="true" />;
    case "other":
      return <BookUser className="size-5" aria-hidden="true" />;
    case "usdt":
    case "usdc":
      return <Wallet className="size-5" aria-hidden="true" />;
    case "zelle":
    case "cashapp":
    case "venmo":
      return <Smartphone className="size-5" aria-hidden="true" />;
    default:
      return <Building2 className="size-5" aria-hidden="true" />;
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
  `${VAULT_TYPES[normalizeVaultType(a.accountType)]?.label ?? a.accountType} ${maskAccountNumber(a.accountNumber)}`;

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
  /** Processing times from TransferMethodConfig, e.g. "within 1 business day". */
  processingTimes?: Record<string, string>;
  onSubmitted?: () => void;
}

export function TransferFormEngine({
  type,
  gate,
  onGateChange,
  accounts,
  limitOverrides = {},
  processingTimes = {},
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
  const [result, setResult] = React.useState<{ reference: string; status: string; id?: string } | null>(null);
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
  // Only a limit configured in the database (TransferMethodConfig) is enforced here.
  const limit: number | undefined = variant ? limitOverrides[variant.methodId] || undefined : undefined;
  const processingNote = variant && processingTimes[variant.methodId] ? `Usually processed ${processingTimes[variant.methodId]}.` : null;

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
          ? "Choose an option."
          : `Enter ${f.label.charAt(0).toLowerCase()}${f.label.slice(1)}.`;
      }
      if (f.confirmOf && v !== (values[f.confirmOf] ?? "").trim())
        return "The two entries don't match.";
      if (f.type === "account-select" && f.excludeFrom && values[f.excludeFrom] === v)
        return "Choose a different account from the one the money is coming from.";
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
          return "We can't find an active Heritage Trust account with this number.";
        if (lookup.isOwn)
          return "This is one of your own accounts. Choose “My own accounts” instead.";
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
        next.walletAddress = data.details.address;
        next.walletAddressConfirm = data.details.address;
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
      delete next.walletAddress;
      delete next.walletAddressConfirm;
      delete next.payeeConfirmed;
      return next;
    });
  };

  const submit = async () => {
    if (!variant) return;
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("Enter your 4 to 6 digit transaction PIN.");
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
      if (lookup.status === "found" && lookup.maskedName)
        fd.append("recipientNameMasked", lookup.maskedName);

      const res = await submitTransfer(fd);
      if (!res.success) {
        if (res.field === "pinCode") setPinError(res.error);
        else setSubmitError(res.error);
        return;
      }
      setResult({ reference: res.reference, status: res.status, id: res.id });
      setPhase("done");
      onSubmitted?.();
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send this transfer. Nothing has been taken from your account. Please try again."));
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
  const currency = selectedAccount?.currency || "USD";

  // Step 1 check: Is beneficiary selected/ready?
  const isBeneficiaryComplete = React.useMemo(() => {
    if (!isRecipientFlow) return !!values.toAccountId && !errors.toAccountId;
    if (selectedBeneficiary) return true;
    if (values.recipientName && (values.accountNumber || values.iban || values.zelleIdentifier || values.cashtag || values.venmoUsername || values.toAccountNumber || values.walletAddress)) {
      return true;
    }
    return false;
  }, [isRecipientFlow, selectedBeneficiary, values, errors.toAccountId]);

  // Step 2 check: Account and Amount
  const isDetailsComplete = React.useMemo(() => {
    return !!values.fromAccountId && amount > 0 && !errors.amount && !errors.fromAccountId;
  }, [values.fromAccountId, amount, errors.amount, errors.fromAccountId]);

  const control = (f: FieldDef) => (
    <FieldControl
      key={f.name}
      f={f}
      value={values[f.name] ?? ""}
      error={showError(f.name)}
      accounts={accounts}
      values={allValues}
      lookup={lookup}
      limit={limit}
      onChange={(v) => setValue(f.name, v, f)}
      onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
      onPayeeConfirm={(checked) => setValues((prev) => ({ ...prev, payeeConfirmed: checked ? "true" : "" }))}
    />
  );

  const recipientLabel = selectedBeneficiary?.name || values.recipientName || lookup.maskedName || "";
  const recipientDetail =
    values.accountNumber
      ? maskAccountNumber(values.accountNumber)
      : values.toAccountNumber
      ? maskAccountNumber(values.toAccountNumber)
      : values.iban
      ? maskAccountNumber(values.iban)
      : values.walletAddress
      ? `${values.walletAddress.slice(0, 6)}…${values.walletAddress.slice(-4)}`
      : values.zelleIdentifier || values.cashtag || (values.venmoUsername ? `@${values.venmoUsername.replace(/^@/, "")}` : "");
  const toAccount = accounts.find((a) => a.id === values.toAccountId);

  if (phase === "done" && result && variant) {
    return (
      <DoneScreen
        result={result}
        rows={[
          ["Reference", <span key="ref" className="font-code text-small">{result.reference}</span>],
          ["Status", <LiveStatusBadge key="st" reference={result.reference} initialStatus={result.status} />],
          ["Method", `${type.title} · ${variant.label}`],
          ...(isRecipientFlow
            ? ([["To", [recipientLabel, recipientDetail].filter(Boolean).join(" · ") || "—"]] as Array<[string, React.ReactNode]>)
            : ([["To", toAccount ? accountLabel(toAccount) : "—"]] as Array<[string, React.ReactNode]>)),
          ["From", selectedAccount ? accountLabel(selectedAccount) : "—"],
          ["Amount", formatAmount(amount, { currency }) ?? "—"],
        ]}
        onAnother={reset}
      />
    );
  }

  const steps = isRecipientFlow ? ["Recipient", "Amount", "Review", "Confirm"] : ["Destination", "Amount", "Review", "Confirm"];
  const currentStep = phase === "confirm" ? 3 : step;

  return (
    <div ref={topRef} className="flex flex-col gap-6">
      <ChoiceCards
        legend={type.gate.label}
        hint={type.gate.help}
        name={`gate-${type.id}`}
        value={gate ?? ""}
        options={type.gate.options}
        icon={getGateIcon}
        disabled={phase !== "form"}
        onChange={requestGateChange}
      />

      {pendingGate && (
        <Alert
          variant="warning"
          title="Change your answer?"
          actions={
            <>
              <Button
                size="sm"
                onClick={() => {
                  const next = pendingGate;
                  setPendingGate(undefined);
                  onGateChange(next ?? null);
                }}
              >
                Change and clear details
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPendingGate(undefined)}>
                Keep my details
              </Button>
            </>
          }
        >
          The rest of the form depends on this answer, so the details you've entered will be cleared.
        </Alert>
      )}

      {variant && (
        <div className="flex flex-col gap-6 border-t border-line pt-6">
          <Stepper steps={steps} current={currentStep} />

          {phase === "form" && step === 0 && (
            <section aria-labelledby="tf-step-0" className="flex flex-col gap-5">
              <StepHeading id="tf-step-0" title={isRecipientFlow ? "Who are you paying?" : "Which account is it going to?"} />
              {isRecipientFlow ? (
                !isBeneficiaryComplete ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ActionCard
                      icon={<BookUser className="size-5" aria-hidden="true" />}
                      title="Choose a saved payee"
                      description={`From your payees for ${variant.label}.`}
                      onClick={() => {
                        setPopoutInitialMode("select");
                        setIsPopoutOpen(true);
                      }}
                    />
                    <ActionCard
                      icon={<UserPlus className="size-5" aria-hidden="true" />}
                      title="Pay someone new"
                      description="Enter their details. You can save them as a payee."
                      onClick={() => {
                        setPopoutInitialMode("add");
                        setIsPopoutOpen(true);
                      }}
                    />
                  </div>
                ) : (
                  <Card variant="muted" className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-caption text-fg-muted">{selectedBeneficiary?.isSaved ? "Saved payee" : "Recipient"}</p>
                      <p className="text-body font-semibold text-fg">
                        {recipientLabel}
                        {selectedBeneficiary?.nickname && (
                          <span className="ml-2 font-normal text-fg-muted">({selectedBeneficiary.nickname})</span>
                        )}
                      </p>
                      <dl className="mt-2 grid gap-x-6 gap-y-1 text-small sm:grid-cols-2">
                        {values.bankName && <MiniDetail term="Bank" value={values.bankName} />}
                        {values.routingNumber && <MiniDetail term="Routing number" value={values.routingNumber} />}
                        {recipientDetail && <MiniDetail term="Account" value={recipientDetail} />}
                        {values.swiftBic && <MiniDetail term="SWIFT/BIC" value={values.swiftBic} />}
                      </dl>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setPopoutInitialMode("select");
                          setIsPopoutOpen(true);
                        }}
                      >
                        Change
                      </Button>
                      <Button size="sm" variant="tertiary" onClick={clearBeneficiary}>
                        Remove
                      </Button>
                    </div>
                  </Card>
                )
              ) : (
                <div className="max-w-md">{visible.filter((f) => f.name === "toAccountId").map(control)}</div>
              )}
              <StepFooter
                hint={!isBeneficiaryComplete ? (isRecipientFlow ? "Choose or add a recipient to continue." : "Choose an account to continue.") : undefined}
                next={
                  <Button disabled={!isBeneficiaryComplete} onClick={() => setStep(1)}>
                    Continue
                  </Button>
                }
              />
            </section>
          )}

          {phase === "form" && step === 1 && (
            <section aria-labelledby="tf-step-1" className="flex flex-col gap-5">
              <StepHeading id="tf-step-1" title="How much, and from which account?" />
              <div className="flex max-w-md flex-col gap-5">
                {visible
                  .filter((f) => ["network", "fromAccountId", "amount", "speed", "currency", "entryClass"].includes(f.name))
                  .map(control)}
              </div>
              <StepFooter
                back={<BackButton onClick={() => setStep(0)} />}
                next={
                  <Button
                    disabled={!isDetailsComplete}
                    onClick={() => {
                      setAttempted(true);
                      if (isDetailsComplete) setStep(2);
                    }}
                  >
                    Continue
                  </Button>
                }
              />
            </section>
          )}

          {phase === "form" && step === 2 && (
            <section aria-labelledby="tf-step-2" className="flex flex-col gap-5">
              <StepHeading id="tf-step-2" title="Check the details" description="Add anything else needed, then check everything before you confirm." />
              <div className="flex max-w-xl flex-col gap-5">
                {visible
                  .filter((f) => ["purpose", "memo", "note", "timing", "scheduledDate", "charges", "exchangeRef", "walletOwnership"].includes(f.name))
                  .map(control)}
                {visible.filter((f) => f.type === "checkbox").map(control)}
              </div>
              <ReviewList
                rows={[
                  ["Method", `${type.title} · ${variant.label}`],
                  ...(isRecipientFlow
                    ? ([["To", [recipientLabel, recipientDetail].filter(Boolean).join(" · ") || "—"]] as Array<[string, React.ReactNode]>)
                    : ([["To", toAccount ? accountLabel(toAccount) : "—"]] as Array<[string, React.ReactNode]>)),
                  ["From", selectedAccount ? accountLabel(selectedAccount) : "—"],
                  ...(values.timing === "scheduled" && values.scheduledDate
                    ? ([["Send on", values.scheduledDate]] as Array<[string, React.ReactNode]>)
                    : []),
                  [
                    "Amount taken from your account",
                    <span key="amt" className="font-semibold tabular-nums">
                      {formatAmount(amount, { currency })}
                    </span>,
                  ],
                ]}
              />
              {processingNote && <p className="text-small text-fg-muted">{processingNote}</p>}
              <StepFooter
                back={<BackButton onClick={() => setStep(1)} />}
                next={
                  <Button
                    onClick={() => {
                      setAttempted(true);
                      const blocking = visible
                        .filter((f) => f.type === "checkbox" || ["purpose", "scheduledDate", "charges", "walletOwnership"].includes(f.name))
                        .some((f) => errors[f.name]);
                      if (!blocking) setPhase("confirm");
                    }}
                  >
                    Continue to confirm
                  </Button>
                }
              />
            </section>
          )}

          {phase === "confirm" && (
            <section aria-labelledby="tf-step-3" className="flex flex-col gap-5">
              <StepHeading
                id="tf-step-3"
                title="Confirm with your transaction PIN"
                description={`You're sending ${formatAmount(amount, { currency })} by ${variant.label}${recipientLabel ? ` to ${recipientLabel}` : ""}.`}
              />
              <div className="max-w-xs">
                <FormField label="Transaction PIN" hint="The 4 to 6 digit PIN you set up for payments." error={pinError}>
                  <Input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ""));
                      setPinError(null);
                    }}
                    className="tracking-[0.4em]"
                  />
                </FormField>
              </div>
              {submitError && (
                <Alert variant="danger" title="Your transfer wasn't sent">
                  {submitError}
                </Alert>
              )}
              <StepFooter
                back={<BackButton label="Back to review" onClick={() => setPhase("form")} disabled={submitting} />}
                next={
                  <Button onClick={submit} loading={submitting} loadingLabel="Sending your transfer" disabled={pin.length < 4}>
                    Send transfer
                  </Button>
                }
              />
            </section>
          )}
        </div>
      )}

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

function ActionCard({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-surface border border-line bg-surface p-4 text-left transition-colors hover:border-line-strong hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <span className="mt-0.5 text-fg-action">{icon}</span>
      <span>
        <span className="block text-body font-semibold text-fg">{title}</span>
        <span className="mt-0.5 block text-small text-fg-muted">{description}</span>
      </span>
    </button>
  );
}

function MiniDetail({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-fg-muted">{term}:</dt>
      <dd className="text-fg">{value}</dd>
    </div>
  );
}

function DoneScreen({
  result,
  rows,
  onAnother,
}: {
  result: { reference: string; status: string; id?: string };
  rows: Array<[string, React.ReactNode]>;
  onAnother: () => void;
}) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => ref.current?.focus(), []);
  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 size-7 shrink-0 text-success" aria-hidden="true" />
        <div>
          <h3 ref={ref} tabIndex={-1} className="font-sans text-h3 text-fg focus:outline-none">
            Transfer request sent
          </h3>
          <p className="mt-1 text-body text-fg-muted">
            Every transfer is checked before it's processed. Its status updates here and in Activity.
          </p>
        </div>
      </div>
      <ReviewList rows={rows} />
      <div className="flex flex-col gap-2 sm:flex-row">
        {result.id && (
          <Button asChild variant="secondary">
            <Link href={`/activities/receipt/${result.id}`}>View receipt</Link>
          </Button>
        )}
        <Button asChild variant="secondary">
          <Link href="/activities">Go to Activity</Link>
        </Button>
        <Button onClick={onAnother}>Make another transfer</Button>
      </div>
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
  limit: number | undefined;
  onChange: (v: string) => void;
  onBlur: () => void;
  onPayeeConfirm: (checked: boolean) => void;
}

function FieldControl({ f, value, error, accounts, values, lookup, limit, onChange, onBlur, onPayeeConfirm }: ControlProps) {
  if (f.type === "notice") {
    return (
      <Alert key={f.name} variant="info" title={f.label}>
        {f.content}
      </Alert>
    );
  }

  if (f.type === "checkbox") {
    return (
      <div>
        <Checkbox
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          onBlur={onBlur}
          aria-invalid={!!error || undefined}
          label={<span className="text-small">{f.content}</span>}
        />
        <div aria-live="polite">{error && <p className="text-small text-danger">{error}</p>}</div>
      </div>
    );
  }

  if (f.type === "radio") {
    return (
      <ChoiceCards
        legend={f.label}
        hint={f.help}
        name={`tf-${f.name}`}
        value={value}
        options={f.options ?? []}
        error={error}
        onChange={(v) => {
          onChange(v);
          onBlur();
        }}
      />
    );
  }

  const optional = f.required === false;

  if (f.type === "account-select") {
    const list = accounts.filter((a) => !(f.excludeFrom && values[f.excludeFrom] === a.id));
    const selected = accounts.find((a) => a.id === value);
    return (
      <FormField
        label={f.label}
        hint={selected ? `Available balance: ${formatAmount(selected.balance, { currency: selected.currency })}` : f.help}
        error={error}
        optional={optional}
      >
        <NativeSelect value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}>
          <option value="">Choose an account</option>
          {list.map((a) => (
            <option key={a.id} value={a.id}>
              {accountLabel(a)} · {formatAmount(a.balance, { currency: a.currency })}
            </option>
          ))}
        </NativeSelect>
      </FormField>
    );
  }

  if (f.type === "select") {
    return (
      <FormField label={f.label} hint={f.help} error={error} optional={optional}>
        <NativeSelect value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}>
          <option value="">Choose one</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      </FormField>
    );
  }

  if (f.type === "textarea") {
    return (
      <FormField label={f.label} hint={f.help} error={error} optional={optional}>
        <Textarea value={value} maxLength={f.maxLength} rows={3} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      </FormField>
    );
  }

  // text | amount | date | account-lookup
  const shown = f.mask ? displayMask(f.mask, value) : value;
  const today = new Date().toISOString().slice(0, 10);
  const numeric = f.type === "amount" || f.mask?.startsWith("digits");
  const hint =
    f.type === "amount" && limit
      ? [f.help, `The most you can send in one transfer is ${formatAmount(limit, { currency: "USD" })}.`].filter(Boolean).join(" ")
      : f.help;
  return (
    <FormField label={f.label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        {f.prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden="true">
            {f.prefix}
          </span>
        )}
        <Input
          type={f.type === "date" ? "date" : "text"}
          min={f.type === "date" ? today : undefined}
          inputMode={f.type === "amount" ? "decimal" : numeric ? "numeric" : undefined}
          autoComplete="off"
          spellCheck={false}
          value={shown}
          maxLength={f.maxLength && !f.mask ? f.maxLength : undefined}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onPaste={f.confirmOf ? (e) => e.preventDefault() : undefined}
          className={cn(f.prefix && "pl-7", numeric && "tabular-nums")}
        />
      </div>
      {f.type === "account-lookup" && (
        <div aria-live="polite">
          {lookup.status === "loading" && <p className="text-small text-fg-muted">Checking the account…</p>}
          {lookup.status === "found" && (
            <Checkbox
              checked={values.payeeConfirmed === "true"}
              onChange={(e) => onPayeeConfirm(e.target.checked)}
              label={
                <span className="text-small">
                  The account holder is <strong>{lookup.maskedName}</strong>. I confirm this is the person I want to pay.
                </span>
              }
            />
          )}
        </div>
      )}
    </FormField>
  );
}
