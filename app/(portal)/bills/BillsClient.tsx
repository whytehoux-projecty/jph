"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Amount } from "@/components/ui/amount";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill, type Status } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocalDate } from "@/components/dashboard/LocalDate";
import type { MoneyAccount } from "@/components/portal/money-fields";
import { deletePayee, type UserBillPermissions } from "@/app/actions/bills";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { AddBillerDialog } from "./components/AddBillerDialog";
import { PayBillForm } from "./components/PayBillForm";

export interface BillerView {
  id: string;
  name: string;
  /** The customer's reference with the biller, masked. */
  reference: string;
  category: string;
}

export interface BillPaymentView {
  id: string;
  transactionId: string | null;
  reference: string | null;
  biller: string;
  accountLabel: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

const STATUS: Record<string, { label: string; status: Status }> = {
  PENDING: { label: "Being checked", status: "warning" },
  PAID: { label: "Sent", status: "success" },
  REJECTED: { label: "Declined", status: "danger" },
};

export default function BillsClient({
  accounts,
  billers,
  payments,
  permissions,
  locale,
  hideBalances,
}: {
  accounts: MoneyAccount[];
  billers: BillerView[];
  payments: BillPaymentView[];
  permissions: UserBillPermissions;
  locale: string;
  hideBalances: boolean;
}) {
  const router = useRouter();
  const refresh = React.useCallback(() => router.refresh(), [router]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [selectedBillerId, setSelectedBillerId] = React.useState(billers[0]?.id ?? "");
  const [removeTarget, setRemoveTarget] = React.useState<BillerView | null>(null);
  const [removing, setRemoving] = React.useState(false);

  const canPay = permissions.enabled && permissions.methods.providers;

  const remove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await deletePayee(removeTarget.id);
      toast.success({ title: "Biller removed" });
      setRemoveTarget(null);
      refresh();
    } catch (err) {
      toast.error({ title: "The biller wasn't removed", description: userFacingError(err, "Please try again.") });
    } finally {
      setRemoving(false);
    }
  };

  const addButton = (variant: "primary" | "secondary") => (
    <Button variant={variant} icon={<Plus aria-hidden="true" />} onClick={() => setAddOpen(true)}>
      Add a biller
    </Button>
  );

  let main: React.ReactNode;
  if (!canPay) {
    main = (
      <Card>
        <EmptyState
          title="Bill payments are turned off for your profile"
          description="Contact us and we'll help you pay your bills."
          action={
            <Button asChild variant="secondary">
              <Link href="/support">Contact support</Link>
            </Button>
          }
        />
      </Card>
    );
  } else if (accounts.length === 0) {
    main = (
      <Card>
        <EmptyState
          title="You need an active account to pay bills"
          description="Once you have an active account, you can pay your bills from it here."
          action={
            <Button asChild>
              <Link href="/vaults">Go to Accounts</Link>
            </Button>
          }
        />
      </Card>
    );
  } else if (billers.length === 0) {
    main = (
      <Card>
        <EmptyState
          icon={ReceiptText}
          title="Add your first biller"
          description="Save a company you pay regularly, with your reference number from their bill. Then pay them here in a few taps."
          action={addButton("primary")}
        />
      </Card>
    );
  } else {
    main = (
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="p-5 sm:p-6 lg:col-span-8">
          <PayBillForm
            accounts={accounts}
            billers={billers}
            selectedBillerId={selectedBillerId}
            onSelectBiller={setSelectedBillerId}
            canAttach={permissions.methods.einvoice}
            locale={locale}
            hideBalances={hideBalances}
            onSubmitted={refresh}
          />
        </Card>
        <aside aria-labelledby="billers-heading" className="lg:col-span-4">
          <Card>
            <h2 id="billers-heading" className="border-b border-line px-5 py-4 font-sans text-h5 text-fg">
              Your billers
            </h2>
            <ul className="divide-y divide-line">
              {billers.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-body text-fg">{b.name}</p>
                    <p className="text-caption text-fg-muted">
                      {b.category} · <span className="font-code">{b.reference}</span>
                    </p>
                  </div>
                  <Button
                    variant="tertiary"
                    size="icon"
                    aria-label={`Remove ${b.name}`}
                    icon={<Trash2 aria-hidden="true" />}
                    onClick={() => setRemoveTarget(b)}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Pay bills"
        description="Pay the companies you owe from your accounts. Our team checks every payment before it's sent."
        actions={canPay && billers.length > 0 ? addButton("secondary") : undefined}
      />

      {main}

      <section aria-labelledby="bill-history-heading" className="mt-10">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 id="bill-history-heading" className="font-sans text-h4 text-fg">
            Recent bill payments
          </h2>
          {payments.length > 0 && (
            <Button asChild variant="link">
              <Link href="/activities">All activity</Link>
            </Button>
          )}
        </div>
        <Card>
          {payments.length === 0 ? (
            <EmptyState compact headingLevel={3} title="No bill payments yet" description="Bills you pay here appear with their status." />
          ) : (
            <Table stackOnMobile>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Biller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead numeric>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const s = STATUS[p.status] ?? { label: p.status.charAt(0) + p.status.slice(1).toLowerCase(), status: "neutral" as Status };
                  return (
                    <TableRow key={p.id}>
                      <TableCell label="Date" className="whitespace-nowrap">
                        <LocalDate iso={p.createdAt} locale={locale} />
                      </TableCell>
                      <TableCell>
                        {p.transactionId ? (
                          <Link href={`/activities/receipt/${p.transactionId}`} className="text-body text-fg underline-offset-[3px] hover:underline">
                            {p.biller}
                          </Link>
                        ) : (
                          <span className="text-body text-fg">{p.biller}</span>
                        )}
                        <span className="block text-caption text-fg-muted">
                          From {p.accountLabel}
                          {p.reference && (
                            <>
                              {" "}
                              · <span className="font-code">{p.reference}</span>
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell label="Status">
                        <StatusPill status={s.status}>{s.label}</StatusPill>
                      </TableCell>
                      <TableCell label="Amount" numeric>
                        <Amount value={-p.amount} currency={p.currency} locale={locale} tone="auto" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      <AddBillerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={(id) => {
          setSelectedBillerId(id);
          toast.success({ title: "Biller saved" });
          refresh();
        }}
      />

      <Dialog open={!!removeTarget} onOpenChange={(o) => !removing && !o && setRemoveTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {removeTarget?.name}?</DialogTitle>
            <DialogDescription>
              They&apos;ll be removed from your billers and from this page&apos;s payment list. Payments you&apos;ve already made stay in Activity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove} loading={removing} loadingLabel="Removing biller">
              Remove biller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
