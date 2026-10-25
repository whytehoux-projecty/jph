"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AmountField, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";
import { createSavingsGoal, updateGoalPlan } from "@/app/actions/savings";
import { userFacingError } from "@/lib/errors";
import type { GoalView } from "../SavingsClient";
import { PlanFields, planPayload, validatePlan, type PlanErrors, type PlanState } from "./PlanFields";

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

function initialPlan(goal: GoalView | null, accounts: MoneyAccount[]): PlanState {
  return {
    accountId: goal?.accountId && accounts.some((a) => a.id === goal.accountId) ? goal.accountId : accounts[0].id,
    mode: goal?.mode ?? "AUTO",
    amount: goal?.amount ? String(goal.amount) : "",
    frequency: goal?.frequency ?? "MONTHLY",
    scheduleDay: goal?.scheduleDay != null ? String(goal.scheduleDay) : "1",
    pin: "",
  };
}

/** Creates a goal, or (with `goal`) changes how an existing goal is funded. */
export function GoalDialog({
  open,
  onOpenChange,
  goal,
  accounts,
  locale,
  hideBalances,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: GoalView | null;
  accounts: MoneyAccount[];
  locale: string;
  hideBalances: boolean;
  onSaved: (message: string) => void;
}) {
  const editing = !!goal;
  const [name, setName] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [plan, setPlan] = React.useState<PlanState>(() => initialPlan(goal, accounts));
  const [errors, setErrors] = React.useState<PlanErrors & { name?: string; target?: string; date?: string }>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setTarget("");
    setTargetDate("");
    setPlan(initialPlan(goal, accounts));
    setErrors({});
    setSubmitError(null);
  }, [open, goal, accounts]);

  const tomorrow = new Date(Date.now() + 86_400_000);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = validatePlan(plan);
    if (!editing) {
      if (!name.trim()) next.name = "Give your goal a name, for example Holiday.";
      if (!parseAmount(target)) next.target = "Enter how much you want to save, for example 5000.";
      if (!targetDate || new Date(targetDate) < tomorrow) next.date = "Choose a date in the future.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setSubmitError(null);
    try {
      const res = editing
        ? await updateGoalPlan(goal!.id, planPayload(plan))
        : await createSavingsGoal({ name: name.trim(), targetAmount: parseAmount(target)!, targetDate, ...planPayload(plan) });
      if (res.success) {
        onOpenChange(false);
        onSaved(editing ? "Plan updated" : "Goal created");
      } else if (res.field === "pin") {
        setErrors({ pin: res.error });
      } else {
        setSubmitError(res.error ?? "We couldn't save this. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't save this. Try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={save} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{editing ? `Change the plan for ${goal!.name}` : "New savings goal"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Change how and when money goes into this goal. Money already saved stays in it."
                : "Money you add is set aside in the goal. You can move it back to an account at any time."}
            </DialogDescription>
          </DialogHeader>
          {!editing && (
            <>
              <FormField label="Goal name" error={errors.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="off" />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <AmountField label="Target" value={target} error={errors.target} onChange={setTarget} />
                <FormField label="Target date" error={errors.date}>
                  <Input type="date" min={isoDate(tomorrow)} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                </FormField>
              </div>
            </>
          )}
          <PlanFields value={plan} onChange={setPlan} errors={errors} accounts={accounts} locale={locale} hideBalances={hideBalances} />
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} loadingLabel={editing ? "Saving the plan" : "Creating your goal"}>
              {editing ? "Save plan" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
