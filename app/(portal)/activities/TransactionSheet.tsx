"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Flag, Printer } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Amount } from "@/components/ui/amount";
import { StatusPill } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Stepper } from "@/components/ui/stepper";
import { addNote, disputeTransaction, updateCategory } from "@/app/actions/transactions";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { CATEGORIES, humanizeType, txStatus, type ActivityRow } from "./activity-row";

const REASONS = [
  "I don't recognise this transaction",
  "The amount is wrong",
  "I was charged more than once",
  "I cancelled this, but it still went through",
  "I didn't receive the goods or service",
  "Something else",
];

type View = "details" | "dispute" | "dispute-review" | "dispute-done";

export function TransactionSheet({
  transaction,
  locale,
  onOpenChange,
  onUpdated,
}: {
  transaction: ActivityRow | null;
  locale: string;
  onOpenChange: (open: boolean) => void;
  onUpdated: (row: ActivityRow) => void;
}) {
  const [view, setView] = useState<View>("details");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setView("details");
    setCategory(transaction?.category ?? "");
    setNote(transaction?.note ?? "");
    setReason("");
    setDetails("");
    setReasonError(null);
    setSubmitError(null);
  }, [transaction?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!transaction) return <Sheet open={false} onOpenChange={onOpenChange} />;

  const t = transaction;
  const st = txStatus(t.status);
  const credit = t.type === "CREDIT";
  const canDispute = !credit && !["DISPUTED", "REJECTED", "CANCELLED", "FAILED"].includes(t.status);
  const when = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(new Date(t.createdAt));

  const saveCategory = async () => {
    setSavingCategory(true);
    try {
      await updateCategory(t.id, category);
      onUpdated({ ...t, category });
      toast.success({ title: "Category saved" });
    } catch (err) {
      toast.error({ title: "The category wasn't saved", description: userFacingError(err, "Please try again.") });
    } finally {
      setSavingCategory(false);
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    try {
      await addNote(t.id, note.trim());
      onUpdated({ ...t, note: note.trim() || null });
      toast.success({ title: "Note saved" });
    } catch (err) {
      toast.error({ title: "The note wasn't saved", description: userFacingError(err, "Please try again.") });
    } finally {
      setSavingNote(false);
    }
  };

  const submitDispute = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await disputeTransaction(t.id, { reason: details.trim() ? `${reason}: ${details.trim()}` : reason });
      onUpdated({ ...t, status: "DISPUTED" });
      setView("dispute-done");
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send your report. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const disputeStep = view === "dispute" ? 0 : view === "dispute-review" ? 1 : 2;

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100vw,30rem)] sm:max-w-none">
        <SheetHeader>
          <SheetTitle>{view === "details" ? t.description || humanizeType(t.transactionType) : "Report a problem"}</SheetTitle>
          <SheetDescription>{view === "details" ? when : t.description}</SheetDescription>
        </SheetHeader>

        {view === "details" && (
          <div className="flex flex-col gap-6">
            <div>
              <Amount value={credit ? t.amount : -t.amount} currency={t.currency} locale={locale} tone="auto" size="figure" />
              <div className="mt-2">
                <StatusPill status={st.status}>{st.label}</StatusPill>
              </div>
            </div>

            <dl className="divide-y divide-line border-y border-line">
              {(
                [
                  ["Type", humanizeType(t.transactionType)],
                  ["Direction", credit ? "Money in" : "Money out"],
                  t.counterparty ? [credit ? "From" : "To", t.counterparty] : null,
                  ["Account", t.accountLast4 ? `Ending ${t.accountLast4}` : "—"],
                  t.channel ? ["Channel", humanizeType(t.channel)] : null,
                  ["Reference", <span key="ref" className="font-code text-small">{t.reference}</span>],
                  t.runningBalance !== null
                    ? ["Balance after", <Amount key="bal" value={t.runningBalance} currency={t.currency} locale={locale} />]
                    : null,
                ].filter(Boolean) as Array<[string, React.ReactNode]>
              ).map(([term, value]) => (
                <div key={term} className="flex justify-between gap-4 py-3">
                  <dt className="text-small text-fg-muted">{term}</dt>
                  <dd className="text-right text-small text-fg">{value}</dd>
                </div>
              ))}
            </dl>

            {t.status === "DISPUTED" && (
              <Alert variant="info" title="You've reported a problem with this transaction">
                We're looking into it and will contact you with the outcome.
              </Alert>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="secondary" icon={<Printer aria-hidden="true" />}>
                <Link href={`/activities/receipt/${t.id}`}>View receipt</Link>
              </Button>
              {canDispute && (
                <Button variant="tertiary" icon={<Flag aria-hidden="true" />} onClick={() => setView("dispute")}>
                  Report a problem
                </Button>
              )}
            </div>

            <section aria-labelledby="tx-organise" className="flex flex-col gap-4 border-t border-line pt-5">
              <h3 id="tx-organise" className="font-sans text-h5 text-fg">Organise</h3>
              <div className="flex items-end gap-2">
                <FormField label="Category" className="flex-1">
                  <NativeSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">No category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <Button variant="secondary" onClick={saveCategory} loading={savingCategory} disabled={category === (t.category ?? "")}>
                  Save
                </Button>
              </div>
              <FormField label="Note" optional hint="Only you can see this.">
                <Textarea rows={2} maxLength={280} value={note} onChange={(e) => setNote(e.target.value)} />
              </FormField>
              <div>
                <Button variant="secondary" onClick={saveNote} loading={savingNote} disabled={note.trim() === (t.note ?? "")}>
                  Save note
                </Button>
              </div>
            </section>
          </div>
        )}

        {view !== "details" && (
          <div className="flex flex-col gap-5">
            <Stepper steps={["Reason", "Review", "Sent"]} current={disputeStep} />

            {view === "dispute" && (
              <>
                <FormField label="What's wrong?" error={reasonError} required>
                  <NativeSelect value={reason} onChange={(e) => setReason(e.target.value)}>
                    <option value="">Choose a reason</option>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Anything else we should know?" optional>
                  <Textarea rows={4} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />
                </FormField>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setView("details")}>
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!reason) return setReasonError("Choose the reason that fits best.");
                      setReasonError(null);
                      setView("dispute-review");
                    }}
                  >
                    Review
                  </Button>
                </div>
              </>
            )}

            {view === "dispute-review" && (
              <>
                <dl className="divide-y divide-line rounded-surface border border-line">
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-small text-fg-muted">Transaction</dt>
                    <dd className="text-right text-small text-fg">
                      <Amount value={-t.amount} currency={t.currency} locale={locale} tone="auto" />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-small text-fg-muted">Reason</dt>
                    <dd className="text-right text-small text-fg">{reason}</dd>
                  </div>
                  {details.trim() && (
                    <div className="px-4 py-3">
                      <dt className="text-small text-fg-muted">Details</dt>
                      <dd className="mt-1 text-small text-fg">{details.trim()}</dd>
                    </div>
                  )}
                </dl>
                <p className="text-small text-fg-muted">
                  The transaction will be marked as disputed while we investigate. We may contact you for more information.
                </p>
                {submitError && <Alert variant="danger" title="Your report wasn't sent">{submitError}</Alert>}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setView("dispute")} disabled={submitting}>
                    Back
                  </Button>
                  <Button onClick={submitDispute} loading={submitting} loadingLabel="Sending report">
                    Send report
                  </Button>
                </div>
              </>
            )}

            {view === "dispute-done" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
                <h3 className="font-sans text-h3 text-fg">Report sent</h3>
                <p className="text-body text-fg-muted">
                  We'll investigate and contact you with the outcome. You can follow its status here in Activity.
                </p>
                <Button className="mt-2" onClick={() => setView("details")}>Back to transaction</Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
