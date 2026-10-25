"use client";

import * as React from "react";
import { BellRing, CalendarClock, CircleSlash } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { ChoiceCards } from "@/components/portal/flow";
import { AccountField, AmountField, type MoneyAccount } from "@/components/portal/money-fields";
import { MAX_MONTH_DAY, WEEKDAYS, describeSchedule, type ContributionMode, type Frequency } from "@/lib/savings-schedule";

export interface PlanState {
  accountId: string;
  mode: ContributionMode;
  amount: string;
  frequency: Frequency;
  scheduleDay: string;
  pin: string;
}

export type PlanErrors = Partial<Record<"amount" | "pin", string>>;

const MODES: Record<ContributionMode, { label: string; description: string; icon: React.ReactNode }> = {
  AUTO: {
    label: "Save automatically",
    description: "We move the amount from your account into the goal on the day.",
    icon: <CalendarClock className="size-5" aria-hidden="true" />,
  },
  MANUAL: {
    label: "Remind me",
    description: "We email you and send a notification on the day; you add the money.",
    icon: <BellRing className="size-5" aria-hidden="true" />,
  },
  NONE: {
    label: "No schedule",
    description: "Add money whenever you like.",
    icon: <CircleSlash className="size-5" aria-hidden="true" />,
  },
};

export function PlanFields({
  value,
  onChange,
  errors,
  accounts,
  locale,
  hideBalances,
}: {
  value: PlanState;
  onChange: (next: PlanState) => void;
  errors: PlanErrors;
  accounts: MoneyAccount[];
  locale: string;
  hideBalances: boolean;
}) {
  const set = (patch: Partial<PlanState>) => onChange({ ...value, ...patch });
  const account = accounts.find((a) => a.id === value.accountId) ?? accounts[0];
  const day = Number(value.scheduleDay);

  return (
    <div className="flex flex-col gap-5">
      <ChoiceCards
        legend="How do you want to save?"
        name="plan-mode"
        value={value.mode}
        options={(["AUTO", "MANUAL", "NONE"] as ContributionMode[]).map((m) => ({ value: m, label: MODES[m].label, description: MODES[m].description }))}
        icon={(m) => MODES[m as ContributionMode].icon}
        onChange={(m) => set({ mode: m as ContributionMode, pin: "" })}
      />
      <AccountField
        label={value.mode === "NONE" ? "Usual account" : "From"}
        accounts={accounts}
        value={value.accountId}
        onChange={(id) => set({ accountId: id })}
        showBalance={!hideBalances}
        locale={locale}
      />
      {value.mode !== "NONE" && (
        <>
          <AmountField label="Amount each time" currency={account.currency} value={value.amount} error={errors.amount} onChange={(v) => set({ amount: v })} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="How often">
              <NativeSelect
                value={value.frequency}
                onChange={(e) => {
                  const frequency = e.target.value as Frequency;
                  set({ frequency, scheduleDay: "1" });
                }}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </NativeSelect>
            </FormField>
            <FormField label={value.frequency === "WEEKLY" ? "On" : "On day"} hint={value.frequency === "MONTHLY" ? `1 to ${MAX_MONTH_DAY}, so every month has it.` : undefined}>
              <NativeSelect value={value.scheduleDay} onChange={(e) => set({ scheduleDay: e.target.value })}>
                {value.frequency === "WEEKLY"
                  ? WEEKDAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))
                  : Array.from({ length: MAX_MONTH_DAY }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
              </NativeSelect>
            </FormField>
          </div>
          <p className="text-small text-fg-muted">{describeSchedule(value.frequency, day)}, starting from the next one.</p>
        </>
      )}
      {value.mode === "AUTO" && (
        <div className="max-w-xs">
          <FormField label="Transaction PIN" hint="Automatic saving moves money without asking again, so we need your PIN once." error={errors.pin}>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={value.pin}
              onChange={(e) => set({ pin: e.target.value.replace(/\D/g, "") })}
              className="tracking-[0.4em]"
            />
          </FormField>
        </div>
      )}
    </div>
  );
}

/** Client-side checks before sending; the server checks again. */
export function validatePlan(plan: PlanState): PlanErrors {
  const errors: PlanErrors = {};
  if (plan.mode !== "NONE") {
    const n = Number(plan.amount.replace(/,/g, ""));
    if (!/^\d+(\.\d{1,2})?$/.test(plan.amount.replace(/,/g, "").trim()) || n <= 0) errors.amount = "Enter how much to save each time, for example 50.00.";
  }
  if (plan.mode === "AUTO" && !/^\d{4,6}$/.test(plan.pin)) errors.pin = "Enter your 4 to 6 digit transaction PIN.";
  return errors;
}

export function planPayload(plan: PlanState) {
  return {
    accountId: plan.accountId,
    mode: plan.mode,
    amount: plan.mode === "NONE" ? undefined : Number(plan.amount.replace(/,/g, "")),
    frequency: plan.mode === "NONE" ? undefined : plan.frequency,
    scheduleDay: plan.mode === "NONE" ? undefined : Number(plan.scheduleDay),
    pin: plan.mode === "AUTO" ? plan.pin : undefined,
  };
}
