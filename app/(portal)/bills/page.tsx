import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { getBillHistory, getPayees, getUserBillPermissions } from "@/app/actions/bills";
import { loadOrSignIn } from "@/lib/portal-data";
import { maskAccountNumber } from "@/lib/format";
import { languageToLocale } from "@/lib/utils";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { BILL_CATEGORIES } from "@/lib/bill-constants";
import BillsClient, { type BillerView, type BillPaymentView } from "./BillsClient";
import type { MoneyAccount } from "@/components/portal/money-fields";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pay bills" };

const categoryLabel = (id: string) => BILL_CATEGORIES.find((c) => c.id === id)?.label ?? "Other";

export default async function BillsPage() {
  const { user, rawAccounts, payees, history, permissions } = await loadOrSignIn(async () => {
    const [user, rawAccounts, payees, history, permissions] = await Promise.all([
      getProfile(),
      getAccounts(),
      getPayees(),
      getBillHistory(),
      getUserBillPermissions(),
    ]);
    return { user, rawAccounts, payees, history, permissions };
  });

  const accountLabel = (a: { accountType: string; accountNumber: string }) =>
    `${VAULT_TYPES[normalizeVaultType(a.accountType)]?.label ?? a.accountType} ${maskAccountNumber(a.accountNumber)}`;

  // Only the bank's own, active accounts can pay bills.
  const accounts: MoneyAccount[] = rawAccounts
    .filter((a) => !a.isExternal && a.status === "ACTIVE")
    .map((a) => ({
      id: a.id,
      label: accountLabel(a),
      accountNumber: a.accountNumber,
      balance: Number(a.balance),
      currency: a.currency || "USD",
    }));

  // A biller reference is the customer's own number with that biller: shown masked.
  const billers: BillerView[] = payees.map((p) => ({
    id: p.id,
    name: p.name,
    reference: maskAccountNumber(p.accountNumber),
    category: categoryLabel(p.category),
  }));

  const payments: BillPaymentView[] = history.map((b) => ({
    id: b.id,
    transactionId: b.transaction?.id ?? null,
    reference: b.transaction?.reference ?? null,
    biller: b.payee.name,
    accountLabel: accountLabel(b.account),
    amount: b.amount,
    currency: b.account.currency || "USD",
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <BillsClient
      accounts={accounts}
      billers={billers}
      payments={payments}
      permissions={permissions}
      locale={languageToLocale(user?.preferredLanguage || "en")}
      hideBalances={!!user?.hideBalance}
    />
  );
}
