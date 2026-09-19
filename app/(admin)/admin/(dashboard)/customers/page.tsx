import { AdminHubPage, QuickLink } from "@/components/admin/AdminHubPage";
import { Users, UserPlus, KeyRound, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function CustomersHubPage() {
  const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
  const activeUsers = await prisma.user.count({ where: { role: 'USER', status: 'ACTIVE' } });
  const suspendedUsers = await prisma.user.count({ where: { role: 'USER', status: 'SUSPENDED' } });
  const flaggedUsers = await prisma.user.count({ where: { role: 'USER', isFlagged: true } });

  const stats = [
    { title: "Total Customers", value: totalUsers, icon: <Users className="w-5 h-5" /> },
    { title: "Active", value: activeUsers, trend: "Good standing", trendPositive: true },
    { title: "Suspended", value: suspendedUsers, trend: "Requires review", trendPositive: false },
    { title: "Flagged", value: flaggedUsers, trend: "Action needed", trendPositive: false },
  ];

  const links: QuickLink[] = [
    { title: "All Account Holders", description: "View and manage all customer accounts.", href: "/admin/customers/account-holders", icon: <Users className="w-6 h-6" /> },
    { title: "Create New Customer", description: "Manually add a new customer to the system.", href: "/admin/customers/create", icon: <UserPlus className="w-6 h-6" /> },
    { title: "New Applications", description: "Review pending account applications.", href: "/admin/customers/applications", icon: <FileText className="w-6 h-6" /> },
    { title: "e-Portal Access", description: "Manage online banking access requests.", href: "/admin/customers/portal-requests", icon: <KeyRound className="w-6 h-6" /> },
  ];

  return (
    <AdminHubPage 
      title="Customer Management" 
      subtitle="Overview of all customer accounts, applications, and portal access."
      stats={stats}
      links={links}
    />
  );
}
