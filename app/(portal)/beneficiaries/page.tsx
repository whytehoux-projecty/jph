import { getBeneficiaries } from "@/app/actions/beneficiaries";
import BeneficiariesClient from "./BeneficiariesClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BeneficiariesPage() {
  let beneficiaries;
  
  try {
    const rawBeneficiaries = await getBeneficiaries();
    beneficiaries = rawBeneficiaries.map((b: any) => ({
      id: b.id,
      name: b.name,
      rail: b.rail || "us_bank",
      details: b.details || "{}",
      status: b.status || "ACTIVE",
      nickname: b.nickname,
      isInternal: b.isInternal,
    }));
  } catch (error) {
    redirect('/login');
  }

  return <BeneficiariesClient initialBeneficiaries={beneficiaries} />;
}
