import { AdminHubPage, QuickLink } from "@/components/admin/AdminHubPage";
import { ArrowRightLeft, Building2, CreditCard, ReceiptText, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function FinanceHubPage() {
  const totalTxns = await prisma.transaction.count();
  const pendingTxns = await prisma.transaction.count({ where: { status: 'PENDING' } });
  
  // Calculate total AUM (Assets Under Management)
  const accounts = await prisma.account.findMany({ select: { balance: true } });
  const totalAUM = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  
  const activeCards = await prisma.card.count({ where: { status: 'ACTIVE' } });

  // Format currency helper
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  const stats = [
    { title: "Total Transactions", value: totalTxns, icon: <ArrowRightLeft className="w-5 h-5" /> },
    { title: "Pending Approvals", value: pendingTxns, trend: pendingTxns > 0 ? "Action needed" : "All caught up", trendPositive: pendingTxns === 0 },
    { title: "Assets Under Mgmt", value: formatter.format(totalAUM), trend: "Across all accounts", trendPositive: true },
    { title: "Active Cards", value: activeCards, trend: "Issued & unlocked", trendPositive: true },
  ];

  const links: QuickLink[] = [
    { title: "Transactions", description: "Review and approve pending fund transfers.", href: "/admin/finance/transactions", icon: <ArrowRightLeft className="w-6 h-6" /> },
    { title: "Bank Accounts", description: "Manage checking, savings, and loan accounts.", href: "/admin/finance/accounts", icon: <Building2 className="w-6 h-6" /> },
    { title: "Cards & Cheques", description: "Manage debit/credit cards and cheque books.", href: "/admin/finance/cards", icon: <CreditCard className="w-6 h-6" /> },
    { title: "Bill Payments", description: "Monitor utility and service payments.", href: "/admin/finance/bills", icon: <ReceiptText className="w-6 h-6" /> },
    { title: "Statements", description: "View generated account statements.", href: "/admin/finance/statements", icon: <FileText className="w-6 h-6" /> },
  ];

  return (
    <AdminHubPage 
      title="Finance & Transactions" 
      subtitle="Overview of financial operations, account balances, and money movement."
      stats={stats}
      links={links}
    />
  );
}
