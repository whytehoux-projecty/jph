"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { updateLimits } from "@/app/actions/cards";
import { formatAmount } from "@/lib/format";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";

/** The card's daily spending limit — the only limit updateLimits stores. */
export function CardLimitsControl({
  cardId,
  dailyLimit,
  currency,
  disabled,
}: {
  cardId: string;
  dailyLimit: number | null;
  currency: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(dailyLimit !== null ? String(dailyLimit) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const n = Number.parseFloat(value);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateLimits(cardId, { dailyLimit: n });
      toast.success({ title: "Daily limit updated", description: `New limit: ${formatAmount(n, { currency })} a day.` });
      router.refresh();
    } catch (err) {
      toast.error({ title: "The limit wasn't changed", description: userFacingError(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  const unchanged = value === (dailyLimit !== null ? String(dailyLimit) : "");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <FormField
        label="Daily spending limit"
        hint={dailyLimit !== null ? `Currently ${formatAmount(dailyLimit, { currency })} a day.` : "No daily limit is set on this card yet."}
        error={error}
        className="sm:max-w-xs sm:flex-1"
      >
        <Input
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ""))}
          className="tabular-nums"
        />
      </FormField>
      <Button variant="secondary" onClick={save} loading={saving} loadingLabel="Saving limit" disabled={disabled || unchanged || !value}>
        Save limit
      </Button>
    </div>
  );
}
