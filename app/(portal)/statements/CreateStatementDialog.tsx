"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { Alert } from "@/components/ui/alert";
import { generateStatement } from "@/app/actions/statements";
import { userFacingError } from "@/lib/errors";
import { periodLabel } from "./period";

/** Last 12 complete months, newest first, as YYYY-MM. */
function recentPeriods(): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 12; i++) {
    d.setMonth(d.getMonth() - 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export function CreateStatementDialog({
  open,
  onOpenChange,
  accounts,
  existing,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Array<{ id: string; label: string }>;
  existing: Array<{ id: string; accountId: string; period: string }>;
  locale: string;
}) {
  const router = useRouter();
  const periods = useMemo(recentPeriods, []);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [period, setPeriod] = useState(periods[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const already = existing.find((s) => s.accountId === accountId && s.period === period);

  const submit = async () => {
    setError(null);
    if (already) {
      router.push(`/statements/${already.id}`);
      return;
    }
    setBusy(true);
    try {
      const created = await generateStatement(accountId, period);
      router.push(`/statements/${created.id}`);
    } catch (err) {
      setError(userFacingError(err, "We couldn't create the statement. Please try again."));
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a statement</DialogTitle>
          <DialogDescription>For any of the last 12 months. It lists the posted transactions for that month.</DialogDescription>
        </DialogHeader>
        <FormField label="Account">
          <NativeSelect value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField label="Month" hint={already ? "You already have this statement. We'll open it." : undefined}>
          <NativeSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
            {periods.map((p) => (
              <option key={p} value={p}>{periodLabel(p, locale)}</option>
            ))}
          </NativeSelect>
        </FormField>
        {error && <Alert variant="danger">{error}</Alert>}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy} loadingLabel="Creating statement" disabled={!accountId}>
            {already ? "Open statement" : "Create statement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
