import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { queryTransactions } from "@/app/actions/transactions";
import { loadOrSignIn } from "@/lib/portal-data";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { maskAccountNumber } from "@/lib/format";
import { languageToLocale } from "@/lib/utils";
import ActivityClient from "./ActivityClient";
import { toActivityRow } from "./activity-row";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const { user, accounts, first } = await loadOrSignIn(async () => {
    const [user, accounts, first] = await Promise.all([getProfile(), getAccounts(), queryTransactions({ page: 1 })]);
    return { user, accounts, first };
  });

  const accountOptions = accounts.map((a) => {
    const def = VAULT_TYPES[normalizeVaultType(a.accountType)];
    const name = a.isExternal ? `${a.institutionName || "External"} ${def?.label ?? a.accountType}` : def?.label ?? a.accountType;
    return { id: a.id, label: `${name} ${maskAccountNumber(a.accountNumber)}` };
  });

  return (
    <ActivityClient
      accounts={accountOptions}
      locale={languageToLocale(user?.preferredLanguage || "en")}
      fallbackCurrency={user?.preferredCurrency || "USD"}
      initial={{ rows: first.rows.map((t) => toActivityRow(t)), total: first.total, pageSize: first.pageSize }}
    />
  );
}
