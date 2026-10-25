"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { addPayee } from "@/app/actions/bills";
import { BILL_CATEGORIES, BILL_REGIONS } from "@/lib/bill-constants";
import { userFacingError } from "@/lib/errors";

/** Saves a biller (name and the customer's own reference with them) for paying later. */
export function AddBillerDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (id: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [category, setCategory] = React.useState(BILL_CATEGORIES[0].id);
  const [country, setCountry] = React.useState("usa");
  const [errors, setErrors] = React.useState<{ name?: string; reference?: string }>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setReference("");
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter the biller's name, as it appears on your bill.";
    if (!/^[A-Za-z0-9 -]{3,40}$/.test(reference.trim())) next.reference = "Enter your account or reference number from the bill: 3 to 40 letters or numbers.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setSubmitError(null);
    try {
      const payee = await addPayee({ name, accountNumber: reference, category, country });
      onAdded(payee.id);
      onOpenChange(false);
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't save this biller. Try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={save} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Add a biller</DialogTitle>
            <DialogDescription>You&apos;ll find these details on a recent bill from them.</DialogDescription>
          </DialogHeader>
          <FormField label="Biller name" error={errors.name}>
            <Input autoComplete="organization" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </FormField>
          <FormField label="Your account or reference number" hint="Your number with this biller, not your bank account number." error={errors.reference}>
            <Input autoComplete="off" className="font-code" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={40} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Type of bill">
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                {BILL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField label="Country">
              <NativeSelect value={country} onChange={(e) => setCountry(e.target.value)}>
                {BILL_REGIONS.filter((r) => r.value !== "all").map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} loadingLabel="Saving the biller">
              Save biller
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
