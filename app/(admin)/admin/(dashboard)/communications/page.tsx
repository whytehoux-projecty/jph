import { AdminHubPage, QuickLink } from "@/components/admin/AdminHubPage";
import { BellRing, LifeBuoy } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function CommunicationsHubPage() {
  const openTickets = await prisma.supportTicket.count({ where: { status: 'OPEN' } });
  const totalTickets = await prisma.supportTicket.count();
  
  const sentNotifications = await prisma.notification.count();

  const stats = [
    { title: "Open Tickets", value: openTickets, icon: <LifeBuoy className="w-5 h-5" />, trend: openTickets > 0 ? "Action needed" : "Inbox zero!", trendPositive: openTickets === 0 },
    { title: "Total Tickets", value: totalTickets, trend: "All time", trendPositive: true },
    { title: "Sent Notifications", value: sentNotifications, icon: <BellRing className="w-5 h-5" /> },
  ];

  const links: QuickLink[] = [
    { title: "Push Notifications", description: "Broadcast messages or send individual alerts to customers.", href: "/admin/communications/notifications", icon: <BellRing className="w-6 h-6" /> },
    { title: "Support Inbox", description: "Manage customer support inquiries and resolve issues.", href: "/admin/communications/support", icon: <LifeBuoy className="w-6 h-6" /> },
  ];

  return (
    <AdminHubPage 
      title="Communications" 
      subtitle="Manage customer interactions, support tickets, and system notifications."
      stats={stats}
      links={links}
    />
  );
}
