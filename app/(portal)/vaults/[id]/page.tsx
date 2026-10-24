import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusPill } from "@/components/ui/badge";
import { AccountNumber } from "@/components/ui/account-number";
import { BalanceVisibilityProvider, BalanceVisibilityToggle, VisibleAmount } from "@/components/dashboard/balance-visibility";
import { RecentTransactions, type DashboardTransaction } from "@/components/dashboard/RecentTransactions";
import { getAccountById, getAccountTransactions } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { languageToLocale } from "@/lib/utils";
import { accountStatus } from "../account-status";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account details" };

const TX_LIMIT = 25;

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const data = await loadOrSignIn(async () => {
    try {
      const [user, account, transactions] = await Promise.all([
        getProfile(),
        getAccountById(id),
        getAccountTransactions(id, TX_LIMIT),
      ]);
      return { user, account, transactions };
    } catch (error) {
      // Someone else's account, or one that doesn't exist: same answer.
      if (error instanceof Error && error.message === "Account not found") return null;
      throw error;
    }
  });
  if (!data) notFound();

  const { user, account, transactions } = data;
  const locale = languageToLocale(user?.preferredLanguage || "en");
  const vaultType = normalizeVaultType(account.accountType);
  const def = VAULT_TYPES[vaultType];
  const typeLabel = def?.label ?? account.accountType;
  const name = account.isExternal ? `${account.institutionName || "External"} ${typeLabel}` : typeLabel;
  const status = accountStatus(account.status);
  const currency = account.currency || user?.preferredCurrency || "USD";
  const opened = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(account.createdAt);

  const txRows: DashboardTransaction[] = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    transactionType: t.transactionType,
    description: t.description,
    amount: Number(t.amount),
    currency: t.currency || currency,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <BalanceVisibilityProvider initialHidden={Boolean(user?.hideBalance)}>
      <PageHeader
        breadcrumb={[{ label: "Accounts", href: "/vaults" }, { label: name }]}
        title={name}
        actions={
          <>
            <Button asChild variant="secondary" icon={<FileText aria-hidden="true" />}>
              <Link href="/statements">Statements</Link>
            </Button>
            {!account.isExternal && account.status === "ACTIVE" && (
              <Button asChild icon={<ArrowLeftRight aria-hidden="true" />}>
                <Link href="/transfer">Make a transfer</Link>
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-label uppercase text-fg-muted">
                {account.isExternal ? "Last reported balance" : "Balance"}
              </h2>
              <p className="mt-2">
                <VisibleAmount value={Number(account.balance)} currency={currency} locale={locale} size="figure" />
              </p>
            </div>
            <BalanceVisibilityToggle />
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {account.isPrimary && <Badge variant="default">Primary account</Badge>}
            {account.isExternal && <Badge variant="outline">Linked account</Badge>}
            {status && <StatusPill status={status.status}>{status.label}</StatusPill>}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-7">
          <h2 className="font-sans text-h5 text-fg">Account details</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Detail term="Account number">
              <AccountNumber value={account.accountNumber} revealable label={name} />
            </Detail>
            <Detail term="Account type">{typeLabel}</Detail>
            <Detail term="Currency">{currency}</Detail>
            <Detail term={account.isExternal ? "Linked on" : "Opened on"}>{opened}</Detail>
            {account.isExternal && account.institutionName && (
              <Detail term="Held at">{account.institutionName}</Detail>
            )}
            <Detail term="Status">{status ? status.label : "Active"}</Detail>
          </dl>
        </Card>
      </div>

      <div className="mt-8">
        <RecentTransactions
          transactions={txRows}
          locale={locale}
          title="Transactions"
          viewAllHref={txRows.length >= TX_LIMIT ? "/activities" : null}
          emptyDescription="There are no transactions on this account yet."
        />
      </div>
    </BalanceVisibilityProvider>
  );
}

function Detail({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption text-fg-muted">{term}</dt>
      <dd className="mt-0.5 text-body text-fg">{children}</dd>
    </div>
  );
}
