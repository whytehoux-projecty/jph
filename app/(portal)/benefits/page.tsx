import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import BenefitsClient from "./BenefitsClient";

export const dynamic = "force-dynamic";

export default async function BenefitsPage() {
  let user;
  
  try {
    user = await getProfile();
    if (!user) {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  return <BenefitsClient />;
}
