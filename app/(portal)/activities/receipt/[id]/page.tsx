import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/badge";
import { exportReceiptData } from "@/app/actions/transactions";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import { formatAmount, maskAccountNumber } from "@/lib/format";
import { languageToLocale } from "@/lib/utils";
import { BRAND } from "@/src/content/facts";
import { humanizeType, toActivityRow, txStatus } from "../../activity-row";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transaction receipt" };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadOrSignIn(async () => {
    try {
      const [user, tx] = await Promise.all([getProfile(), exportReceiptData(id)]);
      return { user, tx };
    } catch (error) {
      if (error instanceof Error && /Not found/i.test(error.message)) return null;
      throw error;
    }
  });
  if (!data) notFound();

  const { user, tx } = data;
  const row = toActivityRow(tx);
  const locale = languageToLocale(user?.preferredLanguage || "en");
  const st = txStatus(row.status);
  const credit = row.type === "CREDIT";
  const when = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(new Date(row.createdAt));
  const processed = tx.processedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(tx.processedAt)
    : null;

  const rows: Array<[string, React.ReactNode]> = [
    ["Description", row.description || humanizeType(row.transactionType)],
    ["Type", humanizeType(row.transactionType)],
    ["Direction", credit ? "Money in" : "Money out"],
    ...(row.counterparty ? ([[credit ? "From" : "To", row.counterparty]] as Array<[string, React.ReactNode]>) : []),
    ["Account", maskAccountNumber(tx.account?.accountNumber)],
    ["Date", when],
    ...(processed ? ([["Processed", processed]] as Array<[string, React.ReactNode]>) : []),
    ["Status", <StatusPill key="s" status={st.status}>{st.label}</StatusPill>],
    ["Reference", <span key="r" className="font-code text-small">{row.reference}</span>],
  ];

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          breadcrumb={[{ label: "Activity", href: "/activities" }, { label: "Receipt" }]}
          title="Transaction receipt"
          actions={<PrintButton />}
        />
      </div>

      <Card className="mx-auto max-w-2xl p-6 sm:p-8 print:max-w-none print:border-0 print:p-0">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/heritage-trust-logo.svg" alt={BRAND.shortName} width={163} height={24} className="h-6 w-auto" />
          <p className="text-right text-small text-fg-muted">{BRAND.vault} receipt</p>
        </div>

        <div className="py-6">
          <p className="text-small text-fg-muted">Amount</p>
          <p className="mt-1 font-sans text-figure text-fg tabular-nums">
            {credit ? "+" : "−"}
            {formatAmount(row.amount, { currency: row.currency, locale })}
          </p>
        </div>

        <dl className="divide-y divide-line border-y border-line">
          {rows.map(([term, value]) => (
            <div key={term} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-6">
              <dt className="text-small text-fg-muted">{term}</dt>
              <dd className="text-body text-fg sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-caption text-fg-muted">
          This receipt confirms the transaction as recorded on {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())}.
          A pending transaction can still change. {BRAND.fdicShort}
        </p>
      </Card>
    </>
  );
}
