import { getAccounts, getVaultEligibilityMap } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import VaultsClient from "../VaultsClient";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VAULT_TYPES, normalizeVaultType } from "@/lib/vault-rules";

export const dynamic = "force-dynamic";

export default async function VaultsAccountsPage() {
  let user, rawAccounts: any[] = [], pendingActionsCount = 0;
  let eligibilityData: any = null;
  
  try {
    user = await getProfile();
    rawAccounts = await getAccounts();
    eligibilityData = await getVaultEligibilityMap();

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

  const hasExplicitPrimary = rawAccounts.some((acc: any) => acc.isPrimary);

  const initialAccounts = rawAccounts.map((acc: any, index: number) => {
    const vType = normalizeVaultType(acc.accountType);
    const typeDef = VAULT_TYPES[vType];
    const isAutoPrimary = !hasExplicitPrimary && index === 0 && (vType === 'SAVINGS' || vType === 'CURRENT');
    const isPrimary = Boolean(acc.isPrimary || isAutoPrimary);

    return {
      id: acc.id,
      name: acc.isExternal 
        ? `${acc.institutionName || 'External'} ${typeDef?.label || acc.accountType}` 
        : `${typeDef?.label || acc.accountType}`,
      accountNumber: acc.accountNumber,
      maskedNumber: acc.accountNumber.startsWith('EXT-') 
        ? `EXT ••••${acc.accountNumber.slice(-4)}` 
        : `••••${acc.accountNumber.slice(-4)}`,
      balance: acc.balance,
      availableBalance: acc.balance,
      type: vType.toLowerCase() as any,
      vaultType: vType,
      isPrimary,
      isExternal: Boolean(acc.isExternal),
      institutionName: acc.institutionName || 'Heritage Trust',
      interestRate: typeDef?.interestRate || "0.00%",
      monthlyChange: 0,
      openedDate: acc.createdAt.toISOString(),
      status: acc.status.toLowerCase() as any,
      currency: acc.currency,
    };
  });

  return (
    <VaultsClient 
      initialAccounts={initialAccounts}
      userPreferences={userPreferences}
      pendingActionsCount={pendingActionsCount}
      promoMessage={user?.eportalNotificationMessage || null}
      eligibilityData={eligibilityData}
    />
  );
}
