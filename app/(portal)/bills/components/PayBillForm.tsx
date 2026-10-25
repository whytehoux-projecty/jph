"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Paperclip, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { BackButton, ReviewList, StepFooter, StepHeading } from "@/components/portal/flow";
import { AccountField, AmountField, RequestSent, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";
import { payBill } from "@/app/actions/bills";
import { formatAmount } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { PRIVATE_FILE_MAX_BYTES } from "@/lib/file-limits";
import { prepareImage } from "@/lib/prepare-image";
import type { BillerView } from "../BillsClient";

type Attachment =
  | { status: "none" }
  | { status: "uploading"; name: string }
  | { status: "ready"; name: string; id: string }
  | { status: "error"; message: string };

/** Uploads a copy of the bill to private storage and returns its id. */
async function uploadBill(file: File): Promise<string> {
  let body: Blob = file;
  let name = file.name;
  if (file.type.startsWith("image/")) {
    body = await prepareImage(file);
    name = "bill.jpg";
  } else if (file.type !== "application/pdf") {
    throw new Error("Use a PDF, or a photo of the bill.");
  }
  if (body.size > PRIVATE_FILE_MAX_BYTES) throw new Error("The file must be smaller than 4 MB.");

  const form = new FormData();
  form.append("file", body, name);
  form.append("side", "BILL");
  const res = await fetch("/api/bills/attachments", { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.id) throw new Error(json.error || "We couldn't attach the bill. Try again.");
  return json.id;
}

export function PayBillForm({
  accounts,
  billers,
  selectedBillerId,
  onSelectBiller,
  canAttach,
  locale,
  hideBalances,
  onSubmitted,
}: {
  accounts: MoneyAccount[];
  billers: BillerView[];
  selectedBillerId: string;
  onSelectBiller: (id: string) => void;
  canAttach: boolean;
  locale: string;
  hideBalances: boolean;
  onSubmitted: () => void;
}) {
  const [phase, setPhase] = React.useState<"form" | "confirm" | "done">("form");
  const [accountId, setAccountId] = React.useState(accounts[0].id);
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const biller = billers.find((b) => b.id === selectedBillerId) ?? billers[0];
  const [amount, setAmount] = React.useState("");
  const [amountError, setAmountError] = React.useState<string | null>(null);
  const [attachment, setAttachment] = React.useState<Attachment>({ status: "none" });
  const [pin, setPin] = React.useState("");
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ reference: string; id?: string } | null>(null);
  const confirmRef = React.useRef<HTMLFormElement>(null);
  const fileId = React.useId();

  const value = parseAmount(amount);
  const money = (n: number) => formatAmount(n, { currency: account.currency, locale }) ?? "—";

  const attach = async (file: File | undefined) => {
    if (!file) return;
    setAttachment({ status: "uploading", name: file.name });
    try {
      const id = await uploadBill(file);
      setAttachment({ status: "ready", name: file.name, id });
    } catch (err) {
      setAttachment({ status: "error", message: err instanceof Error ? err.message : "We couldn't attach the bill. Try again." });
    }
  };

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    let msg: string | null = null;
    if (!value) msg = "Enter the amount to pay, for example 84.20.";
    else if (value > account.balance) msg = "That's more than the available balance of this account.";
    setAmountError(msg);
    if (msg) {
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus());
      return;
    }
    setPhase("confirm");
    requestAnimationFrame(() => confirmRef.current?.querySelector<HTMLElement>("h3")?.focus());
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("Enter your 4 to 6 digit transaction PIN.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await payBill({
        accountId,
        payeeId: biller.id,
        amount: value!,
        pin,
        attachmentId: attachment.status === "ready" ? attachment.id : undefined,
      });
      if (res.success && res.reference) {
        setResult({ reference: res.reference, id: res.id });
        setPin("");
        setPhase("done");
        onSubmitted();
      } else if (res.field === "pin") {
        setPinError(res.error ?? "That PIN isn't right.");
      } else {
        setSubmitError(res.error ?? "We couldn't send this payment. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send this payment. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const summary: Array<[string, React.ReactNode]> = [
    ["To", `${biller.name} · ${biller.reference}`],
    ["From", account.label],
    ["Amount", value ? money(value) : "—"],
    ...(attachment.status === "ready" ? ([["Attached bill", attachment.name]] as Array<[string, React.ReactNode]>) : []),
  ];

  if (phase === "done" && result) {
    return (
      <RequestSent
        title="Bill payment requested"
        description="Our team checks every bill payment before it's sent. Your account is debited when it's approved, and you'll get a notification."
        rows={[["Reference", <span key="r" className="font-code text-small">{result.reference}</span>], ...summary]}
        transactionId={result.id}
        anotherLabel="Pay another bill"
        onAnother={() => {
          setResult(null);
          setPhase("form");
          setAmount("");
          setAttachment({ status: "none" });
        }}
      />
    );
  }

  if (phase === "confirm") {
    return (
      <form ref={confirmRef} onSubmit={confirm} noValidate className="flex flex-col gap-5" aria-labelledby="bill-confirm">
        <StepHeading id="bill-confirm" title="Check and confirm" description="Confirm with your transaction PIN to send the payment request." />
        <ReviewList rows={summary} />
        <div className="max-w-xs">
          <FormField label="Transaction PIN" hint="The 4 to 6 digit PIN you set up for payments." error={pinError}>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setPinError(null);
              }}
              className="tracking-[0.4em]"
            />
          </FormField>
          {pinError?.includes("Settings") && (
            <Button asChild variant="link" className="mt-2">
              <Link href="/settings">Go to Settings</Link>
            </Button>
          )}
        </div>
        {submitError && (
          <Alert variant="danger" title="Your payment wasn't sent">
            {submitError}
          </Alert>
        )}
        <StepFooter
          back={<BackButton label="Change details" onClick={() => setPhase("form")} disabled={submitting} />}
          next={
            <Button loading={submitting} loadingLabel="Sending your payment" disabled={pin.length < 4}>
              Pay {value ? money(value) : ""}
            </Button>
          }
        />
      </form>
    );
  }

  return (
    <form onSubmit={review} noValidate className="flex flex-col gap-5" aria-labelledby="bill-heading">
      <StepHeading id="bill-heading" title="Pay a bill" description="Every bill payment is checked by our team before it's sent." />
      <div className="flex max-w-md flex-col gap-5">
        <FormField label="Biller">
          <NativeSelect value={biller.id} onChange={(e) => onSelectBiller(e.target.value)}>
            {billers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.reference}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <AccountField label="From" accounts={accounts} value={accountId} onChange={setAccountId} showBalance={!hideBalances} locale={locale} />
        <AmountField
          currency={account.currency}
          value={amount}
          error={amountError}
          onChange={(v) => {
            setAmount(v);
            setAmountError(null);
          }}
        />

        {canAttach && (
          <div className="flex flex-col gap-1.5">
            <span id={`${fileId}-label`} className="text-small font-semibold text-fg">
              Copy of the bill <span className="font-normal text-fg-muted">(optional)</span>
            </span>
            <p id={`${fileId}-hint`} className="text-caption text-fg-muted">
              A PDF or photo helps our team check the payment. Stored privately; only our payments team sees it.
            </p>
            {attachment.status === "ready" || attachment.status === "uploading" ? (
              <div className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2" aria-live="polite">
                <span className="flex min-w-0 items-center gap-2 text-small text-fg">
                  <FileText className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                  <span className="truncate">{attachment.name}</span>
                  {attachment.status === "uploading" && <span className="text-fg-muted">Uploading…</span>}
                </span>
                {attachment.status === "ready" && (
                  <Button
                    type="button"
                    variant="tertiary"
                    size="icon"
                    aria-label="Remove the attached bill"
                    icon={<X aria-hidden="true" />}
                    onClick={() => setAttachment({ status: "none" })}
                  />
                )}
              </div>
            ) : (
              <label
                htmlFor={fileId}
                className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-control border border-line-strong px-4 text-small font-semibold text-fg hover:border-fg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
              >
                <Paperclip className="size-4" aria-hidden="true" />
                Attach the bill
                <input
                  id={fileId}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
                  className="sr-only"
                  aria-describedby={`${fileId}-hint`}
                  onChange={(e) => {
                    void attach(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            <div aria-live="polite">{attachment.status === "error" && <p className="text-small text-danger">{attachment.message}</p>}</div>
          </div>
        )}
      </div>
      <StepFooter next={<Button disabled={attachment.status === "uploading"}>Review</Button>} />
    </form>
  );
}
