"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { StepFooter, StepHeading } from "@/components/portal/flow";
import { submitDeposit, type DepositLocation } from "@/app/actions/deposits";
import { formatAmount } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { AccountField, AmountField, RequestSent, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";

/** Books a cash deposit and gives the customer a reference to show at the branch. */
export function CashDeposit({
  accounts,
  locations,
  locale,
  onSubmitted,
}: {
  accounts: MoneyAccount[];
  locations: DepositLocation[];
  locale: string;
  onSubmitted: () => void;
}) {
  const [accountId, setAccountId] = React.useState(accounts[0].id);
  const [locationId, setLocationId] = React.useState(locations[0].id);
  const [amount, setAmount] = React.useState("");
  const [amountError, setAmountError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ reference: string; id?: string; amount: number } | null>(null);

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const location = locations.find((l) => l.id === locationId) ?? locations[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseAmount(amount);
    if (!value) {
      setAmountError("Enter the amount of cash, for example 500.00.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitDeposit({
        accountId,
        method: "cash",
        amount: value,
        currency: account.currency,
        description: `Cash deposit · ${location.name}`,
        metadata: { locationId: location.id, locationName: location.name },
      });
      if (res.success && res.reference) {
        setResult({ reference: res.reference, id: res.id, amount: value });
        onSubmitted();
      } else {
        setSubmitError(res.error ?? "We couldn't book this deposit. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't book this deposit. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <RequestSent
        title="Your cash deposit is booked"
        description="Show this reference at the branch. The money is credited once the teller has counted it."
        rows={[
          ["Reference", <span key="r" className="font-code text-body">{result.reference}</span>],
          ["Branch", `${location.name}, ${location.address}${location.cityStateZip ? `, ${location.cityStateZip}` : ""}`],
          ...(location.hours ? ([["Opening hours", location.hours]] as Array<[string, React.ReactNode]>) : []),
          ["Into", account.label],
          ["Amount", formatAmount(result.amount, { currency: account.currency, locale }) ?? "—"],
        ]}
        transactionId={result.id}
        extra={
          <div className="print:hidden">
            <Button variant="secondary" icon={<Printer aria-hidden="true" />} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        }
        anotherLabel="Book another deposit"
        onAnother={() => {
          setResult(null);
          setAmount("");
        }}
      />
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby="cash-heading" className="flex flex-col gap-5">
      <StepHeading
        id="cash-heading"
        title="Deposit cash at a branch"
        description="Book it here, then take the cash and your reference to the branch."
      />
      <div className="flex max-w-md flex-col gap-5">
        <AccountField label="Into" accounts={accounts} value={accountId} onChange={setAccountId} locale={locale} />
        <FormField label="Branch" hint={location.hours || undefined}>
          <NativeSelect value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} · {l.address}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <AmountField
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
        <Alert variant="danger" title="Not booked">
          {submitError}
        </Alert>
      )}
      <StepFooter next={<Button loading={submitting} loadingLabel="Booking your deposit">Get a reference</Button>} />
    </form>
  );
}
