"use client";

import * as React from "react";
import { Alert } from "@/components/ui/alert";
import { AccountNumber } from "@/components/ui/account-number";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { StepFooter, StepHeading } from "@/components/portal/flow";
import { submitDeposit, type BankRoutingDetails } from "@/app/actions/deposits";
import { formatAmount } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { AccountField, AmountField, CopyRow, RequestSent, parseAmount, type DepositAccount } from "./shared";

/**
 * The details another bank needs to send money in, plus an optional notice
 * so staff can match the incoming transfer when it arrives.
 */
export function BankTransferIn({
  accounts,
  details,
  holderName,
  locale,
  onSubmitted,
}: {
  accounts: DepositAccount[];
  details: BankRoutingDetails;
  holderName: string;
  locale: string;
  onSubmitted: () => void;
}) {
  const [accountId, setAccountId] = React.useState(accounts[0].id);
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];

  const [sender, setSender] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [amountError, setAmountError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ reference: string; id?: string; amount: number } | null>(null);

  const notify = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseAmount(amount);
    if (!value) {
      setAmountError("Enter the amount you're expecting, for example 2500.00.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitDeposit({
        accountId,
        method: "virtual",
        amount: value,
        currency: account.currency,
        description: sender.trim() ? `Incoming transfer from ${sender.trim()}` : "Incoming transfer",
        metadata: { senderName: sender.trim() || undefined },
      });
      if (res.success && res.reference) {
        setResult({ reference: res.reference, id: res.id, amount: value });
        onSubmitted();
      } else {
        setSubmitError(res.error ?? "We couldn't record this. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't record this. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <RequestSent
        title="We'll look out for it"
        description="When the transfer arrives we'll match it and credit your account. You'll get a notification once it's credited."
        rows={[
          ["Reference", <span key="r" className="font-code text-small">{result.reference}</span>],
          ["Into", account.label],
          ["Expected amount", formatAmount(result.amount, { currency: account.currency, locale }) ?? "—"],
          ...(sender.trim() ? ([["From", sender.trim()]] as Array<[string, React.ReactNode]>) : []),
        ]}
        transactionId={result.id}
        anotherLabel="Done"
        onAnother={() => {
          setResult(null);
          setSender("");
          setAmount("");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="bt-details" className="flex flex-col gap-5">
        <StepHeading
          id="bt-details"
          title="Give these details to the sender"
          description="Use them for a domestic ACH or wire transfer, or an international SWIFT payment, into your account."
        />
        <div className="max-w-md">
          <AccountField label="Receiving account" accounts={accounts} value={accountId} onChange={setAccountId} locale={locale} />
        </div>
        <dl className="divide-y divide-line rounded-surface border border-line">
          {holderName && <CopyRow label="Account holder" value={holderName} mono={false} />}
          <CopyRow
            label="Account number"
            value={account.accountNumber}
            display={<AccountNumber value={account.accountNumber} revealable label="receiving account" />}
          />
          <CopyRow label="Routing number (ACH)" value={details.achRouting} />
          <CopyRow label="Routing number (wire)" value={details.wireRouting} />
          {details.swiftBic && <CopyRow label="SWIFT / BIC" value={details.swiftBic} />}
          <CopyRow label="Bank name" value={details.bankName} mono={false} />
          <CopyRow label="Bank address" value={details.bankAddress} mono={false} />
        </dl>
        <Alert variant="info">
          These details are for receiving money only. Share them with people you expect a payment from.
        </Alert>
      </section>

      <form onSubmit={notify} noValidate aria-labelledby="bt-notify" className="flex flex-col gap-5 border-t border-line pt-6">
        <StepHeading
          id="bt-notify"
          title="Expecting a transfer? Let us know (optional)"
          description="It helps us match the payment to you faster when it arrives. Nothing is credited until the money is received."
        />
        <div className="flex max-w-md flex-col gap-5">
          <FormField label="Who is sending it" optional>
            <Input autoComplete="off" value={sender} onChange={(e) => setSender(e.target.value)} maxLength={120} />
          </FormField>
          <AmountField
            label="Expected amount"
            currency={account.currency}
            value={amount}
            error={amountError}
            onChange={(v) => {
              setAmount(v);
              setAmountError(null);
            }}
          />
        </div>
        {submitError && (
          <Alert variant="danger" title="Not recorded">
            {submitError}
          </Alert>
        )}
        <StepFooter next={<Button loading={submitting} loadingLabel="Recording the transfer">Let us know</Button>} />
      </form>
    </div>
  );
}
