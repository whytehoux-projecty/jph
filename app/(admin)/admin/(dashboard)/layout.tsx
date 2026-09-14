import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Search, UserCircle } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const adminName = `${(session.user as any).firstName || 'Admin'} ${(session.user as any).lastName || ''}`;

  return (
    <div className="h-screen bg-neutral-100 flex overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-neutral-200 h-16 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search users, accounts, transactions..." 
                className="w-full pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50 transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <UserCircle className="w-8 h-8 text-muted-foreground" />
              <span>{adminName}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
