"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Landmark, Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { BackButton, ChoiceCards, ReviewList, StepFooter, StepHeading } from "@/components/portal/flow";
import { submitWithdrawal, type DepositLocation, type WithdrawalMethod } from "@/app/actions/deposits";
import { TELLER_ORDER_MINIMUM } from "@/lib/deposit-rules";
import { formatAmount, maskAccountNumber } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { isValidRouting } from "@/lib/transfer-forms/validators";
import { AccountField, AmountField, RequestSent, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";

const METHODS: Record<WithdrawalMethod, { label: string; description: string; icon: React.ReactNode }> = {
  linked_ach: {
    label: "To your account at another bank",
    description: "We send the money by ACH to an account in your name.",
    icon: <Landmark className="size-5" aria-hidden="true" />,
  },
  pre_staged_counter: {
    label: "Cash from a branch",
    description: `Order ${formatAmount(TELLER_ORDER_MINIMUM, { currency: "USD", maximumFractionDigits: 0 })} or more and we'll have it ready to collect.`,
    icon: <Building2 className="size-5" aria-hidden="true" />,
  },
  cashiers_check: {
    label: "Cashier's cheque by courier",
    description: "A bank cheque made out to the payee you choose, delivered to an address.",
    icon: <Mail className="size-5" aria-hidden="true" />,
  },
};

type Errors = Partial<Record<"amount" | "bankName" | "routing" | "number" | "payee" | "address", string>>;

export function Withdraw({
  accounts,
  locations,
  locale,
  hideBalances,
  onSubmitted,
}: {
  accounts: MoneyAccount[];
  locations: DepositLocation[];
  locale: string;
  hideBalances: boolean;
  onSubmitted: () => void;
}) {
  const branches = locations.filter((l) => l.type === "BRANCH");
  const methods = (Object.keys(METHODS) as WithdrawalMethod[]).filter((m) => m !== "pre_staged_counter" || branches.length > 0);

  const [phase, setPhase] = React.useState<"form" | "confirm" | "done">("form");
  const [method, setMethod] = React.useState<WithdrawalMethod>(methods[0]);
  const [accountId, setAccountId] = React.useState(accounts[0].id);
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const [amount, setAmount] = React.useState("");

  const [bankName, setBankName] = React.useState("");
  const [routing, setRouting] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [extType, setExtType] = React.useState<"CHECKING" | "SAVINGS">("CHECKING");
  const [branchId, setBranchId] = React.useState(branches[0]?.id ?? "");
  const [denominations, setDenominations] = React.useState("");
  const [payee, setPayee] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [errors, setErrors] = React.useState<Errors>({});
  const [pin, setPin] = React.useState("");
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ reference: string; id?: string } | null>(null);
  const confirmRef = React.useRef<HTMLFormElement>(null);

  const value = parseAmount(amount);
  const branch = branches.find((b) => b.id === branchId);
  const money = (n: number) => formatAmount(n, { currency: account.currency, locale }) ?? "—";

  const validate = (): Errors => {
    const e: Errors = {};
    if (!value) e.amount = "Enter an amount, for example 250.00.";
    else if (value > account.balance) e.amount = "That's more than the available balance of this account.";
    else if (method === "pre_staged_counter" && value < TELLER_ORDER_MINIMUM) e.amount = `Branch cash orders start at ${money(TELLER_ORDER_MINIMUM)}.`;
    if (method === "linked_ach") {
      if (!bankName.trim()) e.bankName = "Enter the name of the other bank.";
      if (!isValidRouting(routing)) e.routing = "Enter the 9-digit routing number. Check it on a cheque or with the other bank.";
      if (!/^\d{4,17}$/.test(number)) e.number = "Enter the account number: 4 to 17 digits.";
    }
    if (method === "cashiers_check") {
      if (!payee.trim()) e.payee = "Enter who the cheque should be made out to.";
      if (address.trim().length < 10) e.address = "Enter the full delivery address, including the ZIP code.";
    }
    return e;
  };

  const review = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Focus the first invalid field.
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus());
      return;
    }
    setPhase("confirm");
    requestAnimationFrame(() => confirmRef.current?.querySelector<HTMLElement>("h3")?.focus());
  };

  const confirm = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("Enter your 4 to 6 digit transaction PIN.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitWithdrawal({
        accountId,
        method,
        amount: value!,
        pin,
        targetBankDetails: method === "linked_ach" ? { bankName: bankName.trim(), routingNumber: routing, accountNumber: number, accountType: extType } : undefined,
        locationId: method === "pre_staged_counter" ? branchId : undefined,
        denominations: method === "pre_staged_counter" ? denominations : undefined,
        recipientName: method === "cashiers_check" ? payee.trim() : undefined,
        deliveryAddress: method === "cashiers_check" ? address.trim() : undefined,
        notes,
      });
      if (res.success && res.reference) {
        setResult({ reference: res.reference, id: res.id });
        setPin("");
        setPhase("done");
        onSubmitted();
      } else if (res.field === "pin") {
        setPinError(res.error ?? "That PIN isn't right.");
      } else {
        setSubmitError(res.error ?? "We couldn't send this request. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send this request. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const summary: Array<[string, React.ReactNode]> = [
    ["Method", METHODS[method].label],
    ["From", account.label],
    ["Amount", value ? money(value) : "—"],
    ...((method === "linked_ach"
      ? [["To", `${bankName.trim()} · ${extType === "SAVINGS" ? "Savings" : "Checking"} ${maskAccountNumber(number)}`]]
      : method === "pre_staged_counter"
        ? [["Collect from", branch ? `${branch.name}, ${branch.address}` : "—"], ...(denominations.trim() ? [["Notes requested", denominations.trim()]] : [])]
        : [["Payable to", payee.trim()], ["Deliver to", address.trim()]]) as Array<[string, React.ReactNode]>),
  ];

  if (phase === "done" && result) {
    return (
      <RequestSent
        title="Withdrawal requested"
        description="Our team checks every withdrawal before it's processed. Your account is debited when it's approved, and you'll get a notification."
        rows={[["Reference", <span key="r" className="font-code text-small">{result.reference}</span>], ...summary]}
        transactionId={result.id}
        anotherLabel="Make another withdrawal"
        onAnother={() => {
          setResult(null);
          setPhase("form");
          setAmount("");
          setNotes("");
        }}
      />
    );
  }

  if (phase === "confirm") {
    return (
      <form ref={confirmRef} onSubmit={confirm} noValidate className="flex flex-col gap-5" aria-labelledby="wd-confirm">
        <StepHeading id="wd-confirm" title="Check and confirm" description="Confirm with your transaction PIN to send the request." />
        <ReviewList rows={summary} />
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
          {pinError?.includes("Settings") && (
            <Button asChild variant="link" className="mt-2">
              <Link href="/settings">Go to Settings</Link>
            </Button>
          )}
        </div>
        {submitError && (
          <Alert variant="danger" title="Your request wasn't sent">
            {submitError}
          </Alert>
        )}
        <StepFooter
          back={<BackButton label="Change details" onClick={() => setPhase("form")} disabled={submitting} />}
          next={
            <Button loading={submitting} loadingLabel="Sending your request" disabled={pin.length < 4}>
              Request withdrawal
            </Button>
          }
        />
      </form>
    );
  }

  return (
    <form onSubmit={review} noValidate className="flex flex-col gap-6" aria-labelledby="wd-heading">
      <StepHeading id="wd-heading" title="Take money out" description="Every withdrawal is checked by our team before it's processed." />
      <ChoiceCards
        legend="How would you like it?"
        name="withdrawal-method"
        value={method}
        options={methods.map((m) => ({ value: m, label: METHODS[m].label, description: METHODS[m].description }))}
        icon={(m) => METHODS[m as WithdrawalMethod].icon}
        onChange={(m) => {
          setMethod(m as WithdrawalMethod);
          setErrors({});
        }}
      />
      <div className="flex max-w-md flex-col gap-5">
        <AccountField label="From" accounts={accounts} value={accountId} onChange={setAccountId} showBalance={!hideBalances} locale={locale} />
        <AmountField currency={account.currency} value={amount} error={errors.amount} onChange={(v) => setAmount(v)} />

        {method === "linked_ach" && (
          <>
            <FormField label="Other bank's name" error={errors.bankName}>
              <Input autoComplete="off" value={bankName} onChange={(e) => setBankName(e.target.value)} maxLength={120} />
            </FormField>
            <FormField label="Routing number" hint="9 digits" error={errors.routing}>
              <Input inputMode="numeric" autoComplete="off" maxLength={9} className="font-code" value={routing} onChange={(e) => setRouting(e.target.value.replace(/\D/g, ""))} />
            </FormField>
            <FormField label="Account number" error={errors.number}>
              <Input inputMode="numeric" autoComplete="off" maxLength={17} className="font-code" value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))} />
            </FormField>
            <FormField label="Account type">
              <NativeSelect value={extType} onChange={(e) => setExtType(e.target.value as "CHECKING" | "SAVINGS")}>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </NativeSelect>
            </FormField>
          </>
        )}

        {method === "pre_staged_counter" && (
          <>
            <FormField label="Branch" hint={branch?.hours || undefined}>
              <NativeSelect value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} · {b.address}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField label="Notes you'd like" optional hint="For example: $100 and $50 notes.">
              <Input autoComplete="off" value={denominations} onChange={(e) => setDenominations(e.target.value)} maxLength={120} />
            </FormField>
          </>
        )}

        {method === "cashiers_check" && (
          <>
            <FormField label="Pay to the order of" hint="The person or company named on the cheque." error={errors.payee}>
              <Input autoComplete="off" value={payee} onChange={(e) => setPayee(e.target.value)} maxLength={120} />
            </FormField>
            <FormField label="Delivery address" error={errors.address}>
              <Textarea autoComplete="street-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
            </FormField>
          </>
        )}

        <FormField label="Anything we should know" optional>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </FormField>
      </div>
      <StepFooter next={<Button>Review</Button>} />
    </form>
  );
}
