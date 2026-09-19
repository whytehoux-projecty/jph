import { AdminHubPage, QuickLink } from "@/components/admin/AdminHubPage";
import { ShieldCheck, UserCog } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function SystemAdminHubPage() {
  const adminCount = await prisma.adminUser.count();
  
  const stats = [
    { title: "Admin Users", value: adminCount, icon: <UserCog className="w-5 h-5" /> },
    { title: "System Security", value: "Locked", trend: "All protocols active", trendPositive: true },
  ];

  const links: QuickLink[] = [
    { title: "Admin Users", description: "Manage staff accounts and administrative access.", href: "/admin/system/admin-users", icon: <UserCog className="w-6 h-6" /> },
    { title: "Roles & Permissions", description: "Configure access control lists and role capabilities.", href: "/admin/system/roles", icon: <ShieldCheck className="w-6 h-6" /> },
  ];

  return (
    <AdminHubPage 
      title="System Admin" 
      subtitle="Manage internal staff accounts, roles, and administrative security."
      stats={stats}
      links={links}
    />
  );
}
