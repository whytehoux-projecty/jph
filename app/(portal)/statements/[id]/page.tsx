import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/alert";
import { getStatementDetails } from "@/app/actions/statements";
import { exportTransactions } from "@/app/actions/transactions";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import { formatAmount, maskAccountNumber } from "@/lib/format";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { languageToLocale } from "@/lib/utils";
import { BRAND } from "@/src/content/facts";
import { PrintButton } from "../../activities/receipt/[id]/PrintButton";
import { periodLabel, periodRange } from "../period";

export const dynamic = "force-dynamic";
export const metadata = { title: "Statement" };

// Only posted transactions belong on a statement.
const POSTED = new Set(["APPROVED", "COMPLETED"]);

export default async function StatementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadOrSignIn(async () => {
    // Signed-out visitors are sent to sign in by getProfile; past this point
    // a statement that isn't the customer's is simply "not found".
    const user = await getProfile();
    let statement;
    try {
      statement = await getStatementDetails(id);
    } catch {
      return null;
    }
    const range = periodRange(statement.period);
    const txs = range ? await exportTransactions({ accountId: statement.accountId, from: range.from, to: range.to }) : [];
    return { user, statement, txs: txs.filter((t) => POSTED.has(t.status)).reverse() };
  });
  if (!data) notFound();

  const { user, statement, txs } = data;
  const locale = languageToLocale(user?.preferredLanguage || "en");
  const currency = statement.account.currency || "USD";
  const accountName = VAULT_TYPES[normalizeVaultType(statement.account.accountType)]?.label ?? statement.account.accountType;
  const label = periodLabel(statement.period, locale);
  const moneyIn = txs.filter((t) => t.type === "CREDIT").reduce((s, t) => s + Math.abs(t.amount), 0);
  const moneyOut = txs.filter((t) => t.type === "DEBIT").reduce((s, t) => s + Math.abs(t.amount), 0);
  const last = txs[txs.length - 1];
  const closing = last && typeof last.runningBalance === "number" ? last.runningBalance : null;
  const fmt = (n: number) => formatAmount(n, { currency, locale }) ?? "—";
  const date = (d: Date) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          breadcrumb={[{ label: "Statements", href: "/statements" }, { label }]}
          title={`${label} statement`}
          description={`${accountName} ${maskAccountNumber(statement.account.accountNumber)}`}
          actions={<PrintButton />}
        />
      </div>

      <Card className="p-6 sm:p-8 print:border-0 print:p-0">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/heritage-trust-logo.svg" alt={BRAND.shortName} width={163} height={24} className="h-6 w-auto" />
          <div className="text-small sm:text-right">
            <p className="font-semibold text-fg">{user ? `${user.firstName} ${user.lastName}` : ""}</p>
            <p className="text-fg-muted">
              {accountName} {maskAccountNumber(statement.account.accountNumber)}
            </p>
            <p className="text-fg-muted">Statement period: {label}</p>
          </div>
        </div>

        <dl className="grid gap-4 border-b border-line py-6 sm:grid-cols-3">
          <div>
            <dt className="text-caption text-fg-muted">Money in</dt>
            <dd className="mt-1 text-data-lg text-fg tabular-nums">{fmt(moneyIn)}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">Money out</dt>
            <dd className="mt-1 text-data-lg text-fg tabular-nums">{fmt(moneyOut)}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">Closing balance</dt>
            <dd className="mt-1 text-data-lg text-fg tabular-nums">{closing !== null ? fmt(closing) : "—"}</dd>
          </div>
        </dl>

        {txs.length === 0 ? (
          <p className="py-8 text-center text-body text-fg-muted">There were no posted transactions on this account in {label}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-small tabular-nums">
              <caption className="sr-only">Transactions in {label}</caption>
              <thead>
                <tr className="border-b border-fg text-left text-label uppercase text-fg-muted">
                  <th scope="col" className="py-3 pr-4 font-semibold">Date</th>
                  <th scope="col" className="py-3 pr-4 font-semibold">Description</th>
                  <th scope="col" className="py-3 pr-4 text-right font-semibold">Money in</th>
                  <th scope="col" className="py-3 pr-4 text-right font-semibold">Money out</th>
                  <th scope="col" className="py-3 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-b border-line align-top">
                    <td className="whitespace-nowrap py-3 pr-4 text-fg-muted">{date(t.createdAt)}</td>
                    <td className="py-3 pr-4 text-fg">
                      {t.description}
                      <span className="block font-code text-caption text-fg-muted">{t.reference}</span>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-right text-fg">{t.type === "CREDIT" ? fmt(Math.abs(t.amount)) : ""}</td>
                    <td className="whitespace-nowrap py-3 pr-4 text-right text-fg">{t.type === "DEBIT" ? fmt(Math.abs(t.amount)) : ""}</td>
                    <td className="whitespace-nowrap py-3 text-right text-fg">
                      {typeof t.runningBalance === "number" ? fmt(t.runningBalance) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 text-caption text-fg-muted">
          <p>
            Posted transactions only. Pending and declined transactions are shown in Activity. Balances are shown where they
            were recorded when the transaction was posted.
          </p>
          <p>{BRAND.fdicShort}</p>
        </div>
      </Card>

      {closing === null && txs.length > 0 && (
        <Alert variant="info" className="mt-4 print:hidden">
          A closing balance isn't shown because it wasn't recorded for the last transaction in this period.
        </Alert>
      )}
    </>
  );
}
