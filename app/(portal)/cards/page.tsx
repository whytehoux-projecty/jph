import { getCards } from "@/app/actions/cards";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import { maskAccountNumber } from "@/lib/format";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";
import CardsClient, { type CardView } from "./CardsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cards" };

const titleCase = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default async function CardsPage() {
  const { user, cards } = await loadOrSignIn(async () => {
    const [user, cards] = await Promise.all([getProfile(), getCards()]);
    return { user, cards };
  });
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

  return <CardsClient cards={cardViews} />;
}
