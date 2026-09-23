import { prisma } from '@/lib/prisma';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import Link from 'next/link';
import { Bell, Headset, Receipt, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EbankManagementHub() {
  const unreadNotifications = await prisma.notification.count({ where: { isRead: false } });
  const openTickets = await prisma.supportTicket.count({ where: { status: 'OPEN' } });
  const totalPayees = await prisma.payee.count();

  return (
    <AdminPageShell 
      title="e-Bank Management" 
      subtitle="Manage digital banking services, communications, and customer support."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Bill Services */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-playfair font-bold text-charcoal">Bill Services</h3>
              <p className="text-sm text-muted-foreground">Setup and manage payees.</p>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 flex justify-between items-center border border-neutral-100">
            <span className="text-sm font-medium text-charcoal">Total Payees</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">{totalPayees}</span>
          </div>

          <div className="mt-auto">
            <Link 
              href="/admin/ebank/bill-services"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-neutral-300 rounded-md text-sm font-medium text-charcoal hover:bg-neutral-50 transition-colors"
            >
              Manage Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-playfair font-bold text-charcoal">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">Send alerts to customers.</p>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 flex justify-between items-center border border-neutral-100">
            <span className="text-sm font-medium text-charcoal">Unread by Users</span>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">{unreadNotifications}</span>
          </div>

          <div className="mt-auto">
            <Link 
              href="/admin/ebank/notifications"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-neutral-300 rounded-md text-sm font-medium text-charcoal hover:bg-neutral-50 transition-colors"
            >
              Manage Notifications <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Support Inbox */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Headset className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-playfair font-bold text-charcoal">Support Inbox</h3>
              <p className="text-sm text-muted-foreground">Resolve customer tickets.</p>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 flex justify-between items-center border border-neutral-100">
            <span className="text-sm font-medium text-charcoal">Open Tickets</span>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">{openTickets}</span>
          </div>

          <div className="mt-auto">
            <Link 
              href="/admin/ebank/support"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-neutral-300 rounded-md text-sm font-medium text-charcoal hover:bg-neutral-50 transition-colors"
            >
              Go to Inbox <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </AdminPageShell>
  );
}
