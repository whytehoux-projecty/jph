"use client";

import * as React from "react";
import { Camera, Loader2, RotateCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { StepFooter, StepHeading } from "@/components/portal/flow";
import { submitDeposit } from "@/app/actions/deposits";
import { PRIVATE_FILE_MAX_BYTES } from "@/lib/file-limits";
import { prepareImage } from "@/lib/prepare-image";
import { formatAmount } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { AccountField, AmountField, RequestSent, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";

type Photo =
  | { status: "empty" }
  | { status: "uploading"; preview: string }
  | { status: "ready"; preview: string; id: string }
  | { status: "error"; preview?: string; message: string };

function PhotoField({
  side,
  label,
  photo,
  onChange,
  invalid,
}: {
  side: "FRONT" | "BACK";
  label: string;
  photo: Photo;
  onChange: (p: Photo) => void;
  invalid?: boolean;
}) {
  const inputId = React.useId();
  const statusId = `${inputId}-status`;
  const preview = photo.status !== "empty" ? photo.preview : undefined;

  React.useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    let blob: Blob;
    try {
      blob = await prepareImage(file);
    } catch {
      onChange({ status: "error", message: "We couldn't read that photo. Use a JPEG or PNG." });
      return;
    }
    if (blob.size > PRIVATE_FILE_MAX_BYTES) {
      onChange({ status: "error", message: "That photo is too large. Try again with less of the background in shot." });
      return;
    }
    const url = URL.createObjectURL(blob);
    onChange({ status: "uploading", preview: url });
    try {
      const body = new FormData();
      body.append("file", blob, `${side.toLowerCase()}.jpg`);
      body.append("side", side);
      const res = await fetch("/api/deposits/images", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.id) throw new Error(json.error || "We couldn't upload that photo. Try again.");
      onChange({ status: "ready", preview: url, id: json.id });
    } catch (err) {
      onChange({ status: "error", preview: url, message: err instanceof Error ? err.message : "We couldn't upload that photo. Try again." });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-small font-semibold text-fg">{label}</span>
      <label
        htmlFor={inputId}
        className={cn(
          "relative flex aspect-[16/7] cursor-pointer items-center justify-center overflow-hidden rounded-surface border border-dashed bg-surface-muted",
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus hover:border-fg",
          invalid || photo.status === "error" ? "border-danger" : "border-line-strong",
        )}
      >
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          aria-describedby={statusId}
          aria-invalid={invalid || photo.status === "error" || undefined}
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL, never leaves the device
          <img src={preview} alt={`${label}, as you photographed it`} className="size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center text-small text-fg-muted">
            <Camera className="size-6 text-fg-action" aria-hidden="true" />
            Take or choose a photo
          </span>
        )}
        {photo.status === "uploading" && (
          <span className="absolute inset-0 flex items-center justify-center bg-scrim/40">
            <Loader2 className="size-6 animate-spin text-fg-inverse" aria-hidden="true" />
          </span>
        )}
      </label>
      <p id={statusId} aria-live="polite" className={cn("text-caption", photo.status === "error" ? "text-danger" : "text-fg-muted")}>
        {photo.status === "uploading" && "Uploading…"}
        {photo.status === "ready" && (
          <span className="inline-flex items-center gap-1">
            Added. <RotateCw className="size-3" aria-hidden="true" /> Tap the photo to retake it.
          </span>
        )}
        {photo.status === "error" && photo.message}
        {photo.status === "empty" && (invalid ? `Add a photo of the ${side === "FRONT" ? "front" : "back"}.` : " ")}
      </p>
    </div>
  );
}

/** Mobile cheque deposit: photos of both sides, reviewed by staff before the money is credited. */
export function ChequeDeposit({
  accounts,
  locale,
  onSubmitted,
}: {
  accounts: MoneyAccount[];
  locale: string;
  onSubmitted: () => void;
}) {
  const [accountId, setAccountId] = React.useState(accounts[0].id);
  const [amount, setAmount] = React.useState("");
  const [chequeNumber, setChequeNumber] = React.useState("");
  const [front, setFront] = React.useState<Photo>({ status: "empty" });
  const [back, setBack] = React.useState<Photo>({ status: "empty" });
  const [attempted, setAttempted] = React.useState(false);
  const [amountError, setAmountError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ reference: string; id?: string; amount: number } | null>(null);

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];

  const reset = () => {
    setResult(null);
    setAmount("");
    setChequeNumber("");
    setFront({ status: "empty" });
    setBack({ status: "empty" });
    setAttempted(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const value = parseAmount(amount);
    setAmountError(value ? null : "Enter the amount written on the cheque, for example 1250.00.");
    if (!value || front.status !== "ready" || back.status !== "ready") return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitDeposit({
        accountId,
        method: "check",
        amount: value,
        currency: account.currency,
        description: chequeNumber.trim() ? `Mobile cheque deposit · cheque ${chequeNumber.trim()}` : "Mobile cheque deposit",
        metadata: { chequeNumber: chequeNumber.trim() || undefined },
        chequeImageIds: { front: front.id, back: back.id },
      });
      if (res.success && res.reference) {
        setResult({ reference: res.reference, id: res.id, amount: value });
        onSubmitted();
      } else {
        setSubmitError(res.error ?? "We couldn't submit this cheque. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't submit this cheque. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <RequestSent
        title="Cheque submitted"
        description="We'll review the photos and let you know in Notifications when the money is credited. Keep the paper cheque until then."
        rows={[
          ["Reference", <span key="r" className="font-code text-small">{result.reference}</span>],
          ["Into", account.label],
          ["Amount", formatAmount(result.amount, { currency: account.currency, locale }) ?? "—"],
          ...(chequeNumber.trim() ? ([["Cheque number", chequeNumber.trim()]] as Array<[string, React.ReactNode]>) : []),
        ]}
        transactionId={result.id}
        anotherLabel="Deposit another cheque"
        onAnother={reset}
      />
    );
  }

  const busy = front.status === "uploading" || back.status === "uploading";

  return (
    <form onSubmit={submit} noValidate aria-labelledby="chq-heading" className="flex flex-col gap-5">
      <StepHeading
        id="chq-heading"
        title="Deposit a cheque"
        description="Sign the back first. Photograph each side flat on a dark surface, with all four corners in view."
      />
      <div className="flex max-w-md flex-col gap-5">
        <AccountField label="Into" accounts={accounts} value={accountId} onChange={setAccountId} locale={locale} />
        <AmountField
          currency={account.currency}
          value={amount}
          error={amountError}
          onChange={(v) => {
            setAmount(v);
            setAmountError(null);
          }}
        />
        <FormField label="Cheque number" optional hint="Printed at the bottom left of the cheque.">
          <Input inputMode="numeric" autoComplete="off" maxLength={12} value={chequeNumber} onChange={(e) => setChequeNumber(e.target.value.replace(/\D/g, ""))} />
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <PhotoField side="FRONT" label="Front of the cheque" photo={front} onChange={setFront} invalid={attempted && front.status === "empty"} />
        <PhotoField side="BACK" label="Back of the cheque" photo={back} onChange={setBack} invalid={attempted && back.status === "empty"} />
      </div>
      {submitError && (
        <Alert variant="danger" title="Not submitted">
          {submitError}
        </Alert>
      )}
      <StepFooter
        hint="Your photos are stored privately and only seen by our deposits team."
        next={
          <Button loading={submitting} loadingLabel="Submitting your cheque" disabled={busy}>
            Submit cheque
          </Button>
        }
      />
    </form>
  );
}
