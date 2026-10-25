import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { getStatements } from "@/app/actions/statements";
import { loadOrSignIn } from "@/lib/portal-data";
import { maskAccountNumber } from "@/lib/format";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { languageToLocale } from "@/lib/utils";
import StatementsClient, { type StatementRow } from "./StatementsClient";
import { periodLabel } from "./period";

export const dynamic = "force-dynamic";
export const metadata = { title: "Statements" };

export default async function StatementsPage() {
  const { user, accounts, statements } = await loadOrSignIn(async () => {
    const [user, accounts, statements] = await Promise.all([getProfile(), getAccounts(), getStatements()]);
    return { user, accounts, statements };
  });
  const locale = languageToLocale(user?.preferredLanguage || "en");

  const label = (a: { accountType: string; accountNumber: string }) =>
    `${VAULT_TYPES[normalizeVaultType(a.accountType)]?.label ?? a.accountType} ${maskAccountNumber(a.accountNumber)}`;

  const rows: StatementRow[] = statements.map((s) => ({
    id: s.id,
    period: s.period,
    periodLabel: periodLabel(s.period, locale),
    issuedLabel: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(s.generatedAt),
    accountId: s.accountId,
    accountLabel: label(s.account),
  }));

  const withStatements = new Set(rows.map((r) => r.accountId));
  const accountOptions = accounts.filter((a) => withStatements.has(a.id)).map((a) => ({ id: a.id, label: label(a) }));

  const ownAccounts = accounts.filter((a) => !a.isExternal).map((a) => ({ id: a.id, label: label(a) }));

  return <StatementsClient statements={rows} accounts={accountOptions} allAccounts={ownAccounts} locale={locale} />;
}
