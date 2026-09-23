import { AdminHubPage, QuickLink } from "@/components/admin/AdminHubPage";
import { Users, ClipboardList, FileCheck, KeyRound } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function CustomersHubPage() {
  const totalUsers = await prisma.user.count({ where: {} });
  const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
  const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } });
  const flaggedUsers = await prisma.user.count({ where: { isFlagged: true } });

  const stats = [
    { title: "Total Customers", value: totalUsers, icon: <Users className="w-5 h-5" /> },
    { title: "Active", value: activeUsers, trend: "Good standing", trendPositive: true },
    { title: "Suspended", value: suspendedUsers, trend: "Requires review", trendPositive: false },
    { title: "Flagged", value: flaggedUsers, trend: "Action needed", trendPositive: false },
  ];

  const links: QuickLink[] = [
    { 
      title: "All Account Holders", 
      description: "Browse and manage detailed customer profiles, documents, and credentials.", 
      href: "/admin/customers/account-holders", 
      icon: <Users className="w-6 h-6" /> 
    },
    { 
      title: "Application Management", 
      description: "Centralized hub for all incoming onboarding and service activation requests.", 
      href: "/admin/customers/application-management", 
      icon: <ClipboardList className="w-6 h-6" /> 
    },
    { 
      title: "Account Applications", 
      description: "Review preliminary account registration requests and schedule identity verification.", 
      href: "/admin/customers/application-management/account-applications", 
      icon: <FileCheck className="w-6 h-6" /> 
    },
    { 
      title: "e-Portal Requests", 
      description: "Process online and internet banking activation requests from registered account holders.", 
      href: "/admin/customers/application-management/portal-requests", 
      icon: <KeyRound className="w-6 h-6" /> 
    },
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
