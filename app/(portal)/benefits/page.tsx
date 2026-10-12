import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { getAccounts } from "@/app/actions/accounts";
import {
  getUserRewardsData,
  getRecentBenefitActivities,
} from "@/app/actions/benefits";
import BenefitsClient from "./BenefitsClient";

export const dynamic = "force-dynamic";

export default async function BenefitsPage() {
  let userPreferences = {
    language: "en",
    currency: "USD",
    name: "Heritage Client",
    email: "",
    tier: "WORLD_ELITE",
  };

  try {
    const user = await getProfile();
    if (user) {
      userPreferences = {
        language: user.preferredLanguage || "en",
        currency: user.preferredCurrency || "USD",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Heritage Client",
        email: user.email || "",
        tier: user.tier || "WORLD_ELITE",
      };
    }
  } catch {
    redirect("/login");
  }

  let accounts: any[] = [];
  try {
    const rawAccounts = await getAccounts();
    accounts = rawAccounts.map((a: any) => ({
      id: a.id,
      name: a.name || `${a.accountType} Account`,
      accountType: a.accountType,
      balance: a.balance,
      currency: a.currency,
      accountNumber: a.accountNumber,
    }));
  } catch {
    accounts = [];
  }

  let rewardsData: any = {
    pointsBalance: 142500,
    cashEquivalent: 1425,
    pendingPoints: 12400,
    lifetimeEarned: 385000,
    tier: "WORLD_ELITE",
    tierName: "World Elite Private Vault",
    pointsRate: "3x Dining & Travel • 2x Business • 1.5x Vault Assets",
    relationshipDirector: {
      name: "Lord Sterling Vance",
      title: "Senior Managing Wealth Director",
      email: "sterling.vance@heritagetrust.com",
      phone: "+1 (800) 849-2910 ext. 401",
    },
  };

  let recentActivities: any[] = [];

  try {
    const [rewards, activities] = await Promise.all([
      getUserRewardsData(),
      getRecentBenefitActivities(),
    ]);
    rewardsData = rewards;
    recentActivities = activities;
  } catch (err) {
    console.error("Error loading benefits data:", err);
  }

  return (
    <BenefitsClient
      userPreferences={userPreferences}
      accounts={accounts}
      initialRewardsData={rewardsData}
      initialActivities={recentActivities}
    />
  );
}
