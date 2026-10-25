"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AccountField, AmountField, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";
import { contributeToGoal, releaseFromGoal } from "@/app/actions/savings";
import { formatAmount } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import type { GoalView } from "../SavingsClient";

/** Adds money to a goal, or moves money in it back to an account. Both need the PIN. */
export function MoveMoneyDialog({
  direction,
  goal,
  onClose,
  accounts,
  locale,
  hideBalances,
  onDone,
}: {
  direction: "in" | "out";
  goal: GoalView | null;
  onClose: () => void;
  accounts: MoneyAccount[];
  locale: string;
  hideBalances: boolean;
  onDone: (message: string) => void;
}) {
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [errors, setErrors] = React.useState<{ amount?: string; pin?: string }>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!goal) return;
    setAccountId(goal.accountId && accounts.some((a) => a.id === goal.accountId) ? goal.accountId : accounts[0]?.id ?? "");
    setAmount(direction === "in" && goal.amount ? String(goal.amount) : "");
    setPin("");
    setErrors({});
    setSubmitError(null);
  }, [goal, direction, accounts]);

  if (!goal) return null;
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const money = (n: number) => formatAmount(n, { currency: account?.currency || "USD", locale }) ?? "—";
  const isIn = direction === "in";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseAmount(amount);
    const next: typeof errors = {};
    if (!value) next.amount = "Enter an amount, for example 100.00.";
    else if (isIn && value > account.balance) next.amount = "That's more than the available balance of this account.";
    else if (!isIn && value > goal.currentAmount) next.amount = `This goal holds ${money(goal.currentAmount)}.`;
    if (!/^\d{4,6}$/.test(pin)) next.pin = "Enter your 4 to 6 digit transaction PIN.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setSubmitError(null);
    try {
      const res = isIn ? await contributeToGoal(goal.id, value!, accountId, pin) : await releaseFromGoal(goal.id, value!, accountId, pin);
      if (res.success) {
        onClose();
        onDone(isIn ? `${money(value!)} added to ${goal.name}` : `${money(value!)} moved back to your account`);
      } else if (res.field === "pin") {
        setErrors({ pin: res.error });
      } else {
        setSubmitError(res.error ?? "We couldn't move the money. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't move the money. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !busy && !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{isIn ? `Add money to ${goal.name}` : `Move money back from ${goal.name}`}</DialogTitle>
            <DialogDescription>
              {isIn
                ? "The money moves out of your account now and is set aside in this goal."
                : `This goal holds ${money(goal.currentAmount)}. The money goes back into your account now.`}
            </DialogDescription>
          </DialogHeader>
          <AccountField label={isIn ? "From" : "To"} accounts={accounts} value={accountId} onChange={setAccountId} showBalance={!hideBalances} locale={locale} />
          <AmountField currency={account?.currency} value={amount} error={errors.amount} onChange={setAmount} />
          <div className="max-w-xs">
            <FormField label="Transaction PIN" error={errors.pin}>
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="tracking-[0.4em]"
              />
            </FormField>
          </div>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button loading={busy} loadingLabel="Moving the money">
              {isIn ? "Add money" : "Move money back"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
