import { getAccounts } from "@/app/actions/accounts";
import { getProviders } from "@/app/actions/bills";
import BillsClient from "./BillsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  let accounts, providers;
  
  try {
    const rawAccounts = await getAccounts();
    accounts = rawAccounts.map((acc: any) => ({
      id: acc.id,
      name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
      balance: acc.balance,
      accountNumber: acc.accountNumber,
    }));
    
    // We mock providers by transforming the flat list to the nested format expected by the client
    const rawProviders = await getProviders();
    providers = rawProviders.reduce((acc: any, p: any) => {
        if (!acc[p.country]) acc[p.country] = {};
        if (!acc[p.country][p.category]) acc[p.country][p.category] = [];
        acc[p.country][p.category].push(p.name);
        return acc;
    }, {});
    
  } catch (error) {
    redirect('/login');
  }

  return <BillsClient initialAccounts={accounts} initialProviders={providers} />;
}
