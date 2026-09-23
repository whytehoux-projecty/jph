import { getCards } from "@/app/actions/cards";
import CardsClient from "./CardsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  let cards;
  
  try {
    const rawCards = await getCards();
    cards = rawCards.map((card: any) => ({
      id: card.id,
      number: card.cardNumber,
      expiry: card.expiryDate.toISOString(),
      cvc: card.cvv,
      type: card.cardType.toUpperCase(),
      scheme: card.network || 'Visa',
      tier: card.cardType.toUpperCase() === 'CREDIT' ? 'Platinum' : 'Standard',
      status: card.status,
      frozen: card.status === 'FROZEN',
      settings: {
        onlinePayments: true,
        internationalUsage: true,
        contactless: true,
      }
    }));
  } catch (error) {
    redirect('/login');
  }

  return <CardsClient initialCards={cards} />;
}
