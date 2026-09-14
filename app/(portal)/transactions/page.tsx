import { getTransactions, getTransactionStats } from "@/app/actions/transactions";
import { getAccounts } from "@/app/actions/accounts";
import { getProfile } from "@/app/actions/profile";
import TransactionsClient from "./TransactionsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let user, rawAccounts, rawTransactions, stats;
  
  try {
    user = await getProfile();
    rawAccounts = await getAccounts();
    rawTransactions = await getTransactions({ limit: 100 });
    stats = await getTransactionStats("month");
  } catch (error) {
    redirect('/login');
  }

  const userPreferences = {
    language: user?.preferredLanguage || "en",
    currency: user?.preferredCurrency || "USD",
  };

  const initialAccounts = rawAccounts.map((acc: any) => ({
    id: acc.id,
    name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    accountNumber: acc.accountNumber,
  }));

  const initialTransactions = rawTransactions.map((tx: any) => ({
    id: tx.id,
    description: tx.description,
    amount: tx.amount,
    date: tx.createdAt.toISOString(),
    type: tx.type === 'CREDIT' ? 'credit' : 'debit',
    category: tx.metadata ? JSON.parse(tx.metadata).category || 'General' : 'General',
    status: tx.status.toLowerCase(),
    accountId: tx.accountId,
  }));

  const initialStats = {
    deposits: stats.income,
    withdrawals: stats.expenses
  };

  return (
    <TransactionsClient 
      initialTransactions={initialTransactions}
      initialAccounts={initialAccounts}
      initialStats={initialStats}
      userPreferences={userPreferences}
    />
  );
}
