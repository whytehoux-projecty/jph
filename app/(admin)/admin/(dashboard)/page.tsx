import { prisma } from '@/lib/prisma';
import { 
  Users, 
  ArrowRightLeft, 
  FileText, 
  KeyRound, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboard() {
  const pendingApps = await prisma.accountApplication.count({ where: { status: 'PENDING' } });
  const pendingRequests = await prisma.onlineAccessRequest.count({ where: { status: 'PENDING' } });
  const pendingTx = await prisma.transaction.count({ where: { status: 'PENDING' } });
  
  const totalUsers = await prisma.user.count();
  const totalAccounts = await prisma.account.count();
  
  // Get sum of all balances
  const allAccounts = await prisma.account.findMany({ select: { balance: true } });
  const totalAUM = allAccounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Get recent activity (last 5 transactions and last 5 apps)
  const recentTxs = await prisma.transaction.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { account: { include: { user: true } } }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-muted-foreground text-sm font-medium">Pending Apps</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold mt-4">{pendingApps}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-muted-foreground text-sm font-medium">Access Requests</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><KeyRound className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold mt-4">{pendingRequests}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-muted-foreground text-sm font-medium">Pending Transfers</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ArrowRightLeft className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold mt-4">{pendingTx}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-muted-foreground text-sm font-medium">Total Users</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold mt-4">{totalUsers}</p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> +2 this week
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="font-semibold text-charcoal">Recent Activity</h3>
          </div>
          <div className="p-0">
            <div className="divide-y divide-neutral-100">
              {recentTxs.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-600'}`}>
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-charcoal">
                        {tx.account.user.firstName} {tx.account.user.lastName} 
                        <span className="text-muted-foreground font-normal ml-1">initiated a {tx.transactionType.toLowerCase().replace('_', ' ')}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-mono text-muted-foreground">{tx.reference}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">${tx.amount.toFixed(2)}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                      tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentTxs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No recent activity found.</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="font-semibold text-charcoal">System Overview</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total AUM</span>
                <span className="font-semibold">${(totalAUM / 1000000).toFixed(2)}M</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-vintage-gold h-full w-[75%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Active Accounts</span>
                <span className="font-semibold">{totalAccounts}</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[100%]"></div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-neutral-100">
              <p className="text-xs text-muted-foreground text-center">
                System Status: <span className="text-green-600 font-medium">All Systems Operational</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
