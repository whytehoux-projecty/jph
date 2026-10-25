"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill, type Status } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalDate } from "@/components/dashboard/LocalDate";
import { AccountField, AmountField, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";
import { submitLoanApplication } from "@/app/actions/savings";
import type { LoanProduct } from "@/lib/loan-products";
import { userFacingError } from "@/lib/errors";
import type { LoanApplicationView } from "../SavingsClient";

const STATUS: Record<string, { label: string; status: Status }> = {
  PENDING: { label: "Being reviewed", status: "warning" },
  APPROVED: { label: "Approved and paid", status: "success" },
  REJECTED: { label: "Declined", status: "danger" },
};

const EMPLOYMENT = ["Employed", "Self-employed", "Retired", "Not working", "Student"];

function ApplyDialog({
  product,
  onClose,
  accounts,
  locale,
  onSubmitted,
}: {
  product: LoanProduct | null;
  onClose: () => void;
  accounts: MoneyAccount[];
  locale: string;
  onSubmitted: (reference: string) => void;
}) {
  const [amount, setAmount] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [income, setIncome] = React.useState("");
  const [employment, setEmployment] = React.useState(EMPLOYMENT[0]);
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "");
  const [errors, setErrors] = React.useState<Partial<Record<"amount" | "term" | "purpose" | "income", string>>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!product) return;
    setAmount("");
    setTerm("");
    setPurpose("");
    setIncome("");
    setErrors({});
    setSubmitError(null);
  }, [product]);

  if (!product) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseAmount(amount);
    const yearly = parseAmount(income);
    const next: typeof errors = {};
    if (!value) next.amount = "Enter how much you want to borrow.";
    else if (product.minAmount && value < product.minAmount) next.amount = `The smallest ${product.name.toLowerCase()} is $${product.minAmount.toLocaleString()}.`;
    else if (product.maxAmount && value > product.maxAmount) next.amount = `The largest ${product.name.toLowerCase()} is $${product.maxAmount.toLocaleString()}.`;
    if (term && !/^\d{1,3}$/.test(term)) next.term = "Enter the number of months, or leave it blank.";
    if (!purpose.trim()) next.purpose = "Tell us what the loan is for.";
    if (yearly === null) next.income = "Enter your yearly income before tax.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setSubmitError(null);
    try {
      const res = await submitLoanApplication({
        productId: product.id,
        amount: value!,
        termMonths: term ? Number(term) : undefined,
        purpose,
        annualIncome: yearly!,
        employmentStatus: employment,
        targetAccountId: accountId,
      });
      if (res.success && res.reference) {
        onClose();
        onSubmitted(res.reference);
      } else {
        setSubmitError(res.error ?? "We couldn't send your application. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send your application. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !busy && !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Apply for a {product.name.toLowerCase()}</DialogTitle>
            <DialogDescription>
              {product.rate} · {product.terms}. A lending specialist reviews every application; your rate depends on your credit history and the term.
            </DialogDescription>
          </DialogHeader>
          <AmountField
            label="How much do you want to borrow?"
            hint={product.maxAmount ? `$${product.minAmount!.toLocaleString()} to $${product.maxAmount.toLocaleString()}` : undefined}
            value={amount}
            error={errors.amount}
            onChange={setAmount}
          />
          <FormField label="Term in months" optional hint="Leave blank if you'd like us to suggest one." error={errors.term}>
            <Input inputMode="numeric" autoComplete="off" maxLength={3} value={term} onChange={(e) => setTerm(e.target.value.replace(/\D/g, ""))} />
          </FormField>
          <FormField label="What is it for?" error={errors.purpose}>
            <Textarea rows={2} maxLength={500} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AmountField label="Yearly income before tax" value={income} error={errors.income} onChange={setIncome} />
            <FormField label="Employment">
              <NativeSelect value={employment} onChange={(e) => setEmployment(e.target.value)}>
                {EMPLOYMENT.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          <AccountField label="Pay the loan into" accounts={accounts} value={accountId} onChange={setAccountId} locale={locale} />
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button loading={busy} loadingLabel="Sending your application">
              Send application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LoansTab({
  products,
  loans,
  creditScore,
  accounts,
  locale,
  onSubmitted,
}: {
  products: LoanProduct[];
  loans: LoanApplicationView[];
  creditScore: { score: number; change: number; month: string } | null;
  accounts: MoneyAccount[];
  locale: string;
  onSubmitted: (reference: string) => void;
}) {
  const [applying, setApplying] = React.useState<LoanProduct | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {creditScore && (
        <Card variant="muted" className="flex flex-wrap items-baseline gap-x-6 gap-y-1 p-5">
          <h2 className="font-sans text-h5 text-fg">Your credit score</h2>
          <p className="text-data-lg tabular-nums text-fg">{creditScore.score}</p>
          <p className="text-small text-fg-muted">
            {creditScore.change === 0 ? "No change" : `${creditScore.change > 0 ? "Up" : "Down"} ${Math.abs(creditScore.change)} points`} · recorded{" "}
            {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(`${creditScore.month}-01T00:00:00Z`))}
          </p>
        </Card>
      )}

      <section aria-labelledby="loan-products">
        <h2 id="loan-products" className="mb-3 font-sans text-h4 text-fg">
          Apply for a loan
        </h2>
        {products.length === 0 || accounts.length === 0 ? (
          <Card>
            <EmptyState
              compact
              headingLevel={3}
              title="You can't apply for a loan online"
              description={accounts.length === 0 ? "You need an active account to apply." : "Applying online is turned off for your profile. Contact us and a lending specialist will help."}
              action={
                <Button asChild variant="secondary">
                  <Link href="/support">Contact us</Link>
                </Button>
              }
            />
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <h3 className="font-sans text-h5 text-fg">{p.name}</h3>
                  <p className="text-body font-semibold text-fg">{p.rate}</p>
                  <p className="text-small text-fg-muted">
                    {p.description}. {p.terms}.
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                    <Button size="sm" onClick={() => setApplying(p)}>
                      Apply
                    </Button>
                    <Link href={p.href} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-small text-fg-action underline underline-offset-[3px]">
                      Details <ExternalLink className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-small text-fg-muted">
          All credit is subject to approval. Published rates are on our{" "}
          <Link href="/rates-and-fees" className="text-fg-action underline underline-offset-[3px]">
            Rates and fees
          </Link>{" "}
          page.
        </p>
      </section>

      <section aria-labelledby="loan-applications">
        <h2 id="loan-applications" className="mb-3 font-sans text-h4 text-fg">
          Your applications
        </h2>
        <Card>
          {loans.length === 0 ? (
            <EmptyState compact headingLevel={3} title="No applications yet" description="Loans you apply for here appear with their status." />
          ) : (
            <Table stackOnMobile>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead numeric>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((l) => {
                  const s = STATUS[l.status] ?? { label: l.status, status: "neutral" as Status };
                  return (
                    <TableRow key={l.id}>
                      <TableCell label="Date" className="whitespace-nowrap">
                        <LocalDate iso={l.createdAt} locale={locale} />
                      </TableCell>
                      <TableCell>
                        <span className="text-body text-fg">{l.loanName}</span>
                        <span className="block text-caption text-fg-muted">
                          Into {l.accountLabel}
                          {l.termMonths ? ` · ${l.termMonths} months` : ""} · <span className="font-code">{l.reference}</span>
                        </span>
                        {l.status === "REJECTED" && l.rejectionReason && <span className="mt-1 block text-small text-fg-muted">{l.rejectionReason}</span>}
                      </TableCell>
                      <TableCell label="Status">
                        <StatusPill status={s.status}>{s.label}</StatusPill>
                      </TableCell>
                      <TableCell label="Amount" numeric>
                        <Amount value={l.amount} currency={l.currency} locale={locale} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      <ApplyDialog product={applying} onClose={() => setApplying(null)} accounts={accounts} locale={locale} onSubmitted={onSubmitted} />
    </div>
  );
}
