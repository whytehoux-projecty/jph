import { AdminHubPage, QuickLink } from "@/components/admin/AdminHubPage";
import { ActivitySquare, Settings } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CMSHubPage() {
  const stats = [
    { title: "System Status", value: "Healthy", trend: "All systems operational", trendPositive: true },
    { title: "Uptime", value: "99.99%", icon: <ActivitySquare className="w-5 h-5" /> },
  ];

  const links: QuickLink[] = [
    { title: "Audit Logs", description: "Review system activity, logins, and administrative actions.", href: "/admin/cms/audit-logs", icon: <ActivitySquare className="w-6 h-6" /> },
    { title: "System Settings", description: "Configure global platform settings.", href: "/admin/cms/system-settings", icon: <Settings className="w-6 h-6" /> },
  ];

  return (
    <AdminHubPage 
      title="CMS & System" 
      subtitle="Monitor system activity and configure global settings."
      stats={stats}
      links={links}
    />
  );
}
