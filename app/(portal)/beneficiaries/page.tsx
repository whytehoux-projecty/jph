import { getBeneficiaries } from "@/app/actions/beneficiaries";
import { loadOrSignIn } from "@/lib/portal-data";
import BeneficiariesClient from "./BeneficiariesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payees" };

export default async function BeneficiariesPage() {
  const raw = await loadOrSignIn(() => getBeneficiaries());
  const beneficiaries = raw.map((b: any) => ({
    id: b.id,
    name: b.name,
    rail: b.rail || "us_bank",
    details: b.details || "{}",
    status: b.status || "ACTIVE",
    nickname: b.nickname,
    isInternal: b.isInternal,
  }));

  return <BeneficiariesClient initialBeneficiaries={beneficiaries} />;
}
