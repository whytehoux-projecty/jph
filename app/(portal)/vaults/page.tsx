import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { languageToLocale } from "@/lib/utils";
import AccountsClient, { type AccountView } from "./AccountsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accounts" };

export default async function AccountsPage() {
  const { user, accounts } = await loadOrSignIn(async () => {
    const [user, accounts] = await Promise.all([getProfile(), getAccounts()]);
    return { user, accounts };
  });

  const fallbackCurrency = user?.preferredCurrency || "USD";
  const views: AccountView[] = accounts.map((a) => {
    const vaultType = normalizeVaultType(a.accountType);
    const def = VAULT_TYPES[vaultType];
    return {
      id: a.id,
      name: a.isExternal ? `${a.institutionName || "External"} ${def?.label ?? a.accountType}` : def?.label ?? a.accountType,
      accountNumber: a.accountNumber,
      balance: Number(a.balance),
      currency: a.currency || fallbackCurrency,
      vaultType,
      category: def?.category ?? "core",
      canBePrimary: Boolean(def?.canBePrimary),
      isPrimary: a.isPrimary,
      isExternal: a.isExternal,
      institutionName: a.isExternal ? a.institutionName : null,
      status: a.status,
      openedAt: a.createdAt.toISOString(),
    };
  });

  return (
    <AccountsClient
      accounts={views}
      locale={languageToLocale(user?.preferredLanguage || "en")}
      initialHidden={Boolean(user?.hideBalance)}
      bankMessage={user?.eportalNotificationMessage?.trim() || null}
    />
  );
}
