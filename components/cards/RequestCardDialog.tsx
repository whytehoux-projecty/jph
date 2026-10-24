"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Alert } from "@/components/ui/alert";
import { FlowDialog, FlowDone, ReviewList } from "@/components/ui/flow-dialog";
import { requestCard } from "@/app/actions/cards";
import { formatAmount } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface RequestCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Array<{ id: string; name: string; accountNumber: string; balance: number; accountType: string }>;
  onSuccess?: () => void;
}

const STEPS = ["Card type", "Details", "Review", "Sent"];

const TYPES = [
  {
    value: "DEBIT" as const,
    icon: Landmark,
    title: "Debit card",
    description: "Spends money directly from one of your accounts.",
  },
  {
    value: "CREDIT" as const,
    icon: CreditCard,
    title: "Credit card",
    description: "Heritage Rewards Visa®. Subject to approval.",
  },
];

const DESIGNS = [
  { value: "STANDARD", label: "Standard" },
  { value: "GOLD_RESERVE", label: "Gold Reserve" },
  { value: "ONYX_PLATINUM", label: "Onyx Platinum" },
];

export function RequestCardDialog({ isOpen, onClose, accounts = [], onSuccess }: RequestCardDialogProps) {
  const [step, setStep] = React.useState(0);
  const [cardType, setCardType] = React.useState<"DEBIT" | "CREDIT">("DEBIT");
  const [cardTier, setCardTier] = React.useState("STANDARD");
  const [accountId, setAccountId] = React.useState("");
  const [requestedLimit, setRequestedLimit] = React.useState("");
  const [cardholderName, setCardholderName] = React.useState("");
  const [billingAddress, setBillingAddress] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);

  React.useEffect(() => {
    if (accounts.length > 0 && !accountId) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  const account = accounts.find((a) => a.id === accountId);
  const limitNum = Number.parseFloat(requestedLimit);

  const close = () => {
    setStep(0);
    setCardType("DEBIT");
    setCardTier("STANDARD");
    setRequestedLimit("");
    setCardholderName("");
    setBillingAddress("");
    setErrors({});
    setSubmitError(null);
    setResult(null);
    onClose();
  };

  const toReview = () => {
    const next: Record<string, string> = {};
    if (!cardholderName.trim()) next.name = "Enter your name as it should appear on the card.";
    else if (cardholderName.trim().length > 26) next.name = "Use 26 characters or fewer.";
    if (cardType === "DEBIT" && !accountId) next.account = "Choose the account this card will spend from.";
    if (cardType === "CREDIT" && requestedLimit && !(limitNum > 0)) next.limit = "Enter an amount greater than zero, or leave it empty.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(2);
  };

  const submit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await requestCard({
        cardType,
        accountId: cardType === "DEBIT" ? accountId : undefined,
        cardTier,
        cardholderName: cardholderName.trim(),
        billingAddress: billingAddress.trim() || "Primary Address on File",
        requestedLimit: cardType === "CREDIT" ? (limitNum > 0 ? limitNum : 10000) : undefined,
      });
      setResult(res);
      setStep(3);
      onSuccess?.();
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send your request. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const footer =
    step === 0 ? (
      <>
        <Button variant="tertiary" onClick={close}>Cancel</Button>
        <Button onClick={() => setStep(1)} disabled={cardType === "DEBIT" && accounts.length === 0}>Continue</Button>
      </>
    ) : step === 1 ? (
      <>
        <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setStep(0)}>Back</Button>
        <Button onClick={toReview}>Review</Button>
      </>
    ) : step === 2 ? (
      <>
        <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setStep(1)} disabled={loading}>Back</Button>
        <Button onClick={submit} loading={loading} loadingLabel="Sending request">Send request</Button>
      </>
    ) : (
      <Button fullWidth onClick={close}>Done</Button>
    );

  return (
    <FlowDialog
      open={isOpen}
      onClose={close}
      title="Request a card"
      description="We review every request and let you know the outcome."
      steps={STEPS}
      step={step}
      footer={footer}
      busy={loading}
    >
      {step === 0 && (
        <>
          <fieldset>
            <legend className="mb-3 text-small font-semibold text-fg">Which card do you need?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {TYPES.map(({ value, icon: Icon, title, description }) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-surface border border-line bg-surface p-4 transition-colors hover:border-line-strong",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                    "has-[:checked]:border-action has-[:checked]:bg-action-subtle",
                  )}
                >
                  <input type="radio" name="card-type" value={value} checked={cardType === value} onChange={() => setCardType(value)} className="sr-only" />
                  <Icon className="mt-0.5 size-5 shrink-0 text-fg-action" aria-hidden="true" />
                  <span>
                    <span className="block text-body font-semibold text-fg">{title}</span>
                    <span className="mt-0.5 block text-small text-fg-muted">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {cardType === "CREDIT" && (
            <p className="text-small text-fg-muted">
              Rates, fees and rewards are set out on the{" "}
              <Link href="/personal-banking/credit-cards" className="font-semibold text-fg-action underline underline-offset-[3px]">
                Heritage Rewards Visa®
              </Link>{" "}
              page.
            </p>
          )}
          {cardType === "DEBIT" && accounts.length === 0 && (
            <Alert variant="info">You need an active account before you can request a debit card.</Alert>
          )}
        </>
      )}

      {step === 1 && (
        <>
          <FormField label="Name on the card" hint="Up to 26 characters, as you'd like it printed." error={errors.name} required>
            <Input autoComplete="name" maxLength={26} value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} />
          </FormField>
          {cardType === "DEBIT" ? (
            <FormField label="Account to spend from" error={errors.account} required>
              <NativeSelect value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </NativeSelect>
            </FormField>
          ) : (
            <FormField label="Credit limit you'd like" optional hint="In US dollars. We'll tell you the limit we can offer." error={errors.limit}>
              <Input inputMode="decimal" autoComplete="off" value={requestedLimit} onChange={(e) => setRequestedLimit(e.target.value.replace(/[^\d.]/g, ""))} className="tabular-nums" />
            </FormField>
          )}
          <FormField label="Card design">
            <NativeSelect value={cardTier} onChange={(e) => setCardTier(e.target.value)}>
              {DESIGNS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Delivery address" optional hint="Leave empty to use the address we have on file.">
            <Textarea rows={3} autoComplete="street-address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
          </FormField>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-body text-fg-muted">Check the details below, then send your request.</p>
          <ReviewList
            rows={[
              ["Card", cardType === "DEBIT" ? "Debit card" : "Heritage Rewards Visa® credit card"],
              ["Name on the card", cardholderName.trim().toUpperCase()],
              ...(cardType === "DEBIT"
                ? ([["Spends from", account?.name ?? "—"]] as Array<[string, React.ReactNode]>)
                : ([["Credit limit requested", limitNum > 0 ? formatAmount(limitNum, { currency: "USD" }) : "Our decision"]] as Array<[string, React.ReactNode]>)),
              ["Design", DESIGNS.find((d) => d.value === cardTier)?.label ?? cardTier],
              ["Delivery address", billingAddress.trim() || "Address on file"],
            ]}
          />
          {submitError && <Alert variant="danger" title="Your request wasn't sent">{submitError}</Alert>}
        </>
      )}

      {step === 3 && result && (
        <FlowDone title="Request sent">
          <p className="text-body text-fg-muted">We'll review it and let you know the outcome. You can follow its progress on this page.</p>
        </FlowDone>
      )}
    </FlowDialog>
  );
}
