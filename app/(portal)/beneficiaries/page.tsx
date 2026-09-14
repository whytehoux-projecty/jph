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
      accountNumber: b.accountNumber,
      bankName: b.bankName,
      swiftCode: b.swiftCode,
      nickname: b.nickname,
      email: b.email,
      isInternal: b.isInternal,
    }));
  } catch (error) {
    redirect('/login');
  }

  return <BeneficiariesClient initialBeneficiaries={beneficiaries} />;
}
