import SavingsClient from "./SavingsClient";
import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  let userPreferences;
  
  try {
    const user = await getProfile();
    userPreferences = {
      language: user?.preferredLanguage || "en",
      currency: user?.preferredCurrency || "USD",
    };
  } catch (error) {
    redirect('/login');
  }

  return <SavingsClient userPreferences={userPreferences} />;
}
