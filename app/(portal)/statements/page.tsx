import { getAccounts } from "@/app/actions/accounts";
import { getStatements } from "@/app/actions/statements";
import StatementsClient from "./StatementsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StatementsPage() {
  let accounts, statements;
  
  try {
    const rawAccounts = await getAccounts();
    accounts = rawAccounts.map((acc: any) => ({
      id: acc.id,
      name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    }));
    
    statements = await getStatements();
  } catch (error) {
    redirect('/login');
  }

  return <StatementsClient initialStatements={statements} initialAccounts={accounts} />;
}
