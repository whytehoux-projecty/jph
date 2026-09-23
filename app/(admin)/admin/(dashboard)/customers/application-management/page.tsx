import { prisma } from '@/lib/prisma';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import Link from 'next/link';
import { FileText, KeyRound, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ApplicationManagementHub() {
  const pendingApps = await prisma.accountApplication.count({ where: { status: 'PENDING' } });
  const pendingRequests = await prisma.onlineAccessRequest.count({ where: { status: 'PENDING' } });

  return (
    <AdminPageShell 
      title="Customer Application Management" 
      subtitle="Manage all customer applications and access requests."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Account Applications */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-playfair font-bold text-charcoal">Account Applications</h3>
              <p className="text-sm text-muted-foreground">New customer registration requests.</p>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 flex justify-between items-center border border-neutral-100">
            <span className="text-sm font-medium text-charcoal">Pending Review</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">{pendingApps}</span>
          </div>

          <div className="mt-auto">
            <Link 
              href="/admin/customers/application-management/account-applications"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-neutral-300 rounded-md text-sm font-medium text-charcoal hover:bg-neutral-50 transition-colors"
            >
              Manage Applications <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* e-Portal Requests */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <KeyRound className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-playfair font-bold text-charcoal">e-Portal Access</h3>
              <p className="text-sm text-muted-foreground">Requests to activate internet banking.</p>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 flex justify-between items-center border border-neutral-100">
            <span className="text-sm font-medium text-charcoal">Pending Review</span>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">{pendingRequests}</span>
          </div>

          <div className="mt-auto">
            <Link 
              href="/admin/customers/application-management/portal-requests"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-neutral-300 rounded-md text-sm font-medium text-charcoal hover:bg-neutral-50 transition-colors"
            >
              Manage Requests <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
