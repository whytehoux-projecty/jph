"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark, Link2, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BalanceVisibilityProvider, BalanceVisibilityToggle, VisibleAmount } from "@/components/dashboard/balance-visibility";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { totalsByCurrency } from "@/lib/format";
import { requestPrimaryVaultChange } from "@/app/actions/accounts";
import type { VaultType } from "@/lib/vault-rules";
import { AccountCard } from "./components/AccountCard";
import { AccountSwapDialog, LinkExternalAccountDialog, OpenAccountDialog } from "./components/AccountActionDialogs";

export interface AccountView {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  vaultType: VaultType;
  category: "core" | "sub";
  canBePrimary: boolean;
  isPrimary: boolean;
  isExternal: boolean;
  institutionName: string | null;
  status: string;
  openedAt: string;
}

type Filter = "all" | "core" | "sub" | "external";
type Sort = "balance-desc" | "balance-asc" | "name-asc";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "core", label: "Everyday and savings" },
  { value: "sub", label: "Specialist" },
  { value: "external", label: "Linked" },
];

export default function AccountsClient({
  accounts,
  locale,
  initialHidden,
  bankMessage,
}: {
  accounts: AccountView[];
  locale: string;
  initialHidden: boolean;
  bankMessage: string | null;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("balance-desc");
  const [query, setQuery] = useState("");
  const [openOpen, setOpenOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [swapFor, setSwapFor] = useState<string | null>(null);

  const ownAccounts = accounts.filter((a) => !a.isExternal);
  const totals = totalsByCurrency(ownAccounts);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts
      .filter((a) =>
        filter === "all" ? true : filter === "external" ? a.isExternal : !a.isExternal && a.category === filter,
      )
      .filter(
        (a) =>
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.accountNumber.endsWith(q) ||
          (a.institutionName ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) =>
        sort === "name-asc" ? a.name.localeCompare(b.name) : sort === "balance-asc" ? a.balance - b.balance : b.balance - a.balance,
      );
  }, [accounts, filter, query, sort]);

  // The action dialogs take the stored account shape.
  const dialogAccounts = accounts.map((a) => ({
    id: a.id,
    accountType: a.vaultType,
    accountNumber: a.accountNumber,
    balance: a.balance,
    currency: a.currency,
    institutionName: a.institutionName ?? undefined,
  }));

  const requestPrimary = async (account: AccountView) => {
    try {
      const res = await requestPrimaryVaultChange(account.id);
      toast.success({ title: "Request sent", description: res.message });
      router.refresh();
    } catch (err) {
      toast.error({
        title: "We couldn't send your request",
        description: userFacingError(err, "Please try again in a few minutes."),
      });
    }
  };

  return (
    <BalanceVisibilityProvider initialHidden={initialHidden}>
      <PageHeader
        title="Accounts"
        description="Balances and details for every account you hold with us, and any you have linked."
        actions={
          <>
            <Button variant="secondary" icon={<Link2 aria-hidden="true" />} onClick={() => setLinkOpen(true)}>
              Link an account
            </Button>
            <Button icon={<Plus aria-hidden="true" />} onClick={() => setOpenOpen(true)}>
              Open an account
            </Button>
          </>
        }
      />

      {bankMessage && (
        <Alert variant="warning" title="Message from Heritage Trust" className="mb-6">
          {bankMessage}
        </Alert>
      )}

      {accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Landmark}
            title="You don't have any accounts yet"
            description="Open an account with us, or link an account you hold elsewhere to see it here."
            action={
              <>
                <Button onClick={() => setOpenOpen(true)}>Open an account</Button>
                <Button variant="secondary" onClick={() => setLinkOpen(true)}>
                  Link an account
                </Button>
              </>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <h2 className="text-label uppercase text-fg-muted">Total held with Heritage Trust</h2>
              <ul className="mt-2 flex flex-wrap gap-x-8 gap-y-1">
                {totals.map((t, i) => (
                  <li key={t.currency}>
                    <VisibleAmount value={t.total} currency={t.currency} locale={locale} size={i === 0 ? "figure" : "lg"} />
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-small text-fg-muted">
                {ownAccounts.length} {ownAccounts.length === 1 ? "account" : "accounts"}
                {accounts.length > ownAccounts.length && `, plus ${accounts.length - ownAccounts.length} linked`}
              </p>
            </div>
            <BalanceVisibilityToggle />
          </Card>

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="lg:max-w-xl">
              <TabsList aria-label="Filter accounts">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.value} value={f.value}>
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
                <Input
                  type="search"
                  aria-label="Search accounts"
                  placeholder="Name or last 4 digits"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="sm:w-52">
                <NativeSelect aria-label="Sort accounts" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                  <option value="balance-desc">Highest balance first</option>
                  <option value="balance-asc">Lowest balance first</option>
                  <option value="name-asc">Name (A–Z)</option>
                </NativeSelect>
              </div>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {visible.length} of {accounts.length} accounts.
          </p>

          {visible.length === 0 ? (
            <Card>
              <EmptyState
                compact
                icon={Search}
                title="No accounts match"
                description={query ? `Nothing matches “${query}”.` : "You have no accounts of this kind."}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Show all accounts
                  </Button>
                }
              />
            </Card>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((a) => (
                <li key={a.id}>
                  <AccountCard
                    account={a}
                    locale={locale}
                    onRequestPrimary={() => requestPrimary(a)}
                    onRequestSwap={() => setSwapFor(a.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-small text-fg-muted">
            Interest rates and fees for each account type are published on our{" "}
            <Link href="/rates-and-fees" className="font-semibold text-fg-action underline underline-offset-[3px]">
              Rates and fees
            </Link>{" "}
            page.
          </p>
        </>
      )}

      <OpenAccountDialog
        isOpen={openOpen}
        onClose={() => setOpenOpen(false)}
        existingAccounts={dialogAccounts}
        onSuccess={() => router.refresh()}
      />
      <LinkExternalAccountDialog
        isOpen={linkOpen}
        onClose={() => setLinkOpen(false)}
        existingAccounts={dialogAccounts}
        onSuccess={() => router.refresh()}
      />
      <AccountSwapDialog
        isOpen={swapFor !== null}
        onClose={() => setSwapFor(null)}
        existingAccounts={dialogAccounts}
        preselectedAccountId={swapFor ?? undefined}
        onSuccess={() => router.refresh()}
      />
    </BalanceVisibilityProvider>
  );
}
