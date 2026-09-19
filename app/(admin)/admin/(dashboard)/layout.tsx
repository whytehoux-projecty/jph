import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { Search, UserCircle, Bell } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const adminName = `${(session.user as any).firstName || 'Admin'} ${(session.user as any).lastName || ''}`;

  // Fetch badge counts
  const pendingApps = await prisma.accountApplication.count({ where: { status: 'PENDING' } });
  const pendingRequests = await prisma.onlineAccessRequest.count({ where: { status: 'PENDING' } });
  const pendingTxns = await prisma.transaction.count({ where: { status: 'PENDING' } });
  const openTickets = await prisma.supportTicket.count({ where: { status: 'OPEN' } });

  const totalNotifications = pendingApps + pendingRequests + pendingTxns + openTickets;

  return (
    <div className="h-screen bg-neutral-100 flex overflow-hidden font-sans">
      <AdminSidebar badgeCounts={{ pendingApps, pendingRequests, pendingTxns, openTickets }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white border-b border-neutral-200 h-16 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 flex items-center gap-6">
            <AdminBreadcrumb />
            
            <div className="relative w-64 md:w-96 hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-1.5 bg-neutral-100 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50 transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-charcoal transition-colors hover:bg-neutral-100 rounded-full">
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <UserCircle className="w-8 h-8 text-muted-foreground" />
              <span className="hidden sm:inline-block">{adminName}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
