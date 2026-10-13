import VaultsLanding from "./VaultsLanding";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface VaultsPageProps {
  searchParams?: Promise<{ view?: string }>;
}

export default async function VaultsPage({ searchParams }: VaultsPageProps) {
  const params = await searchParams;
  if (params?.view === "accounts") {
    redirect("/vaults/accounts");
  }

  return <VaultsLanding />;
}
