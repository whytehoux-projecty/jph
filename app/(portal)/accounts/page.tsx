import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import AccountsClient from "./AccountsClient";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  let user, rawAccounts, pendingActionsCount = 0;
  
  try {
    user = await getProfile();
    rawAccounts = await getAccounts();
    if (user?.id) {
      // Calculate pending actions for the user
      const unreadNotifications = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
      const pendingTx = await prisma.transaction.count({ where: { account: { userId: user.id }, status: 'PENDING' } });
      const pendingTickets = await prisma.supportTicket.count({ where: { userId: user.id, status: 'OPEN' } });
      
      pendingActionsCount = unreadNotifications + pendingTx + pendingTickets;
    }
  } catch (error) {
    redirect('/login');
  }

  const userPreferences = {
    language: user?.preferredLanguage || "en",
    currency: user?.preferredCurrency || "USD",
  };

  const initialAccounts = rawAccounts.map((acc: any) => ({
    id: acc.id,
    name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    accountNumber: acc.accountNumber,
    maskedNumber: `****${acc.accountNumber.slice(-4)}`,
    balance: acc.balance,
    availableBalance: acc.balance,
    type: acc.accountType.toLowerCase(),
    interestRate:
      acc.accountType.toLowerCase().includes("savings")
        ? "4.20% APY"
        : acc.accountType.toLowerCase().includes("credit") || acc.accountType.toLowerCase().includes("loan")
        ? "21.99% APR"
        : acc.accountType.toLowerCase().includes("investment") || acc.accountType.toLowerCase().includes("wealth")
        ? "Variable"
        : "0.00%",
    monthlyChange: 0,
    openedDate: acc.createdAt.toISOString(),
    status: acc.status.toLowerCase(),
    currency: acc.currency,
  }));

  return (
    <AccountsClient 
      initialAccounts={initialAccounts}
      userPreferences={userPreferences}
      pendingActionsCount={pendingActionsCount}
      promoMessage={user?.eportalNotificationMessage || null}
    />
  );
}
