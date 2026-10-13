import { getCards, getCardRequests } from "@/app/actions/cards";
import { getAccounts } from "@/app/actions/accounts";
import CardsClient from "./CardsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  let cards = [];
  let cardRequests = [];
  let accounts = [];
  
  try {
    const rawCards = await getCards();
    cardRequests = await getCardRequests();
    const rawAccounts = await getAccounts();

    accounts = rawAccounts.map((acc: any) => ({
      id: acc.id,
      name: acc.accountType,
      accountNumber: acc.accountNumber,
      balance: acc.balance,
      accountType: acc.accountType,
    }));

    cards = rawCards.map((card: any) => ({
      id: card.id,
      number: card.cardNumber,
      expiry: card.expiryDate.toISOString(),
      cvc: card.cvv,
      type: card.cardType.toUpperCase(),
      scheme: card.network || 'Visa',
      tier: card.cardTier || (card.cardType.toUpperCase() === 'CREDIT' ? 'Platinum' : 'Standard'),
      status: card.status,
      frozen: card.status === 'FROZEN',
      imageUrl: card.cardImageUrl || null,
      dailyLimit: card.dailyLimit || (card.cardType === 'CREDIT' ? 10000 : 2500),
      settings: {
        onlinePayments: true,
        internationalUsage: true,
        contactless: true,
      }
    }));
  } catch (error) {
    redirect('/login');
  }

  return (
    <CardsClient
      initialCards={cards}
      cardRequests={cardRequests}
      accounts={accounts}
    />
  );
}
