import { notFound } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await loadOrSignIn(() => getProfile());
  if (!user) notFound();

  const address = [user.address, user.city, [user.state, user.zipCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <SettingsClient
      profile={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? "",
        address: address || null,
        pinSetupComplete: user.pinSetupComplete,
        preferredLanguage: user.preferredLanguage || "en",
        hideBalance: user.hideBalance,
      }}
    />
  );
}
