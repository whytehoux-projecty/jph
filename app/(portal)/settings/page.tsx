import { getProfile } from "@/app/actions/profile";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let profile;
  
  try {
    profile = await getProfile();
  } catch (error) {
    redirect('/login');
  }

  return <SettingsClient initialProfile={profile} />;
}
