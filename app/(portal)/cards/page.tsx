import { getCards, getCardRequests } from "@/app/actions/cards";
import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import { maskAccountNumber } from "@/lib/format";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import { languageToLocale } from "@/lib/utils";
import CardsClient, { type CardView, type CardRequestView } from "./CardsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cards" };

const titleCase = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default async function CardsPage() {
  const { user, cards, requests, accounts } = await loadOrSignIn(async () => {
    const [user, cards, requests, accounts] = await Promise.all([getProfile(), getCards(), getCardRequests(), getAccounts()]);
    return { user, cards, requests, accounts };
  });
  const locale = languageToLocale(user?.preferredLanguage || "en");
  const accountLabel = (a: { accountType: string; accountNumber: string }) =>
    `${VAULT_TYPES[normalizeVaultType(a.accountType)]?.label ?? a.accountType} ${maskAccountNumber(a.accountNumber)}`;

  // Only the last four digits leave the server here; full details are fetched
  // on request by revealCardDetails().
  const cardViews: CardView[] = cards.map((c) => {
    const exp = c.expiryDate;
    return {
      id: c.id,
      last4: c.cardNumber.replace(/\D/g, "").slice(-4),
      expiry: `${String(exp.getUTCMonth() + 1).padStart(2, "0")}/${String(exp.getUTCFullYear()).slice(-2)}`,
      type: c.cardType.toUpperCase() === "CREDIT" ? "Credit" : "Debit",
      network: titleCase(c.network || "Visa"),
      tier: c.cardTier ? titleCase(c.cardTier) : null,
      status: c.status,
      imageUrl: c.cardImageUrl || null,
      dailyLimit: typeof c.dailyLimit === "number" ? c.dailyLimit : null,
      currency: c.account?.currency || "USD",
      accountId: c.accountId,
      accountLabel: c.account ? accountLabel(c.account) : null,
      holderName: user ? `${user.firstName} ${user.lastName}`.toUpperCase() : "",
    };
  });

  const requestViews: CardRequestView[] = requests.map((r) => ({
    id: r.id,
    label: `${titleCase(r.cardType)} card${r.cardTier && r.cardTier !== "STANDARD" ? ` · ${titleCase(r.cardTier)}` : ""}`,
    status: r.status,
    reason: r.rejectionReason,
    requestedOn: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(r.createdAt),
  }));

  const linkable = accounts
    .filter((a) => !a.isExternal && a.status === "ACTIVE")
    .map((a) => ({ id: a.id, name: accountLabel(a), accountNumber: a.accountNumber, balance: Number(a.balance), accountType: a.accountType }));

  return <CardsClient cards={cardViews} requests={requestViews} accounts={linkable} locale={locale} />;
}
