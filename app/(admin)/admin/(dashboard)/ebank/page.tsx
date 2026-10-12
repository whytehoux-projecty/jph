import { prisma } from '@/lib/prisma';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import Link from 'next/link';
import {
  Bell,
  Headset,
  Receipt,
  ArrowRight,
  ArrowDownToLine,
  BadgeDollarSign,
  Gift,
  ArrowRightLeft,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EbankManagementHub() {
  const [unreadNotifications, openTickets, totalPayees, pendingBills, pendingDeposits, pendingLoans, totalRedemptions] =
    await Promise.all([
      prisma.notification.count({ where: { isRead: false } }),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.payee.count(),
      prisma.bill.count({ where: { status: 'PENDING' } }),
      prisma.transaction.count({
        where: {
          status: 'PENDING',
          OR: [
            { category: 'DEPOSIT' },
            {
              transactionType: {
                in: ['CASH_DEPOSIT', 'VIRTUAL_DEPOSIT', 'CHECK_DEPOSIT', 'CARD_DEPOSIT', 'CRYPTO_DEPOSIT'],
              },
            },
          ],
        },
      }),
      prisma.transaction.count({
        where: {
          status: 'PENDING',
          OR: [{ category: 'LOAN' }, { transactionType: 'LOAN_APPLICATION' }],
        },
      }),
      prisma.transaction.count({
        where: {
          OR: [{ category: 'REWARDS' }, { transactionType: 'REWARD_REDEMPTION' }],
        },
      }),
    ]);

  const cards = [
    {
      title: 'Deposits & Treasury',
      description: 'Manage routing, crypto addresses, and clear customer deposits.',
      statLabel: 'Pending Clearance',
      statValue: pendingDeposits,
      statVariant: pendingDeposits > 0 ? 'amber' : 'emerald',
      href: '/admin/ebank/deposits',
      icon: ArrowDownToLine,
      color: 'blue',
    },
    {
      title: 'Loans Underwriting',
      description: 'Review credit requests, approve rates, and disburse vault funds.',
      statLabel: 'Pending Decision',
      statValue: pendingLoans,
      statVariant: pendingLoans > 0 ? 'amber' : 'emerald',
      href: '/admin/ebank/loans',
      icon: BadgeDollarSign,
      color: 'amber',
    },
    {
      title: 'Rewards & Concierge',
      description: 'VIP advisory bookings, 24/7 concierge, and points redemptions.',
      statLabel: 'Total Redemptions',
      statValue: totalRedemptions,
      statVariant: 'emerald',
      href: '/admin/ebank/benefits',
      icon: Gift,
      color: 'purple',
    },
    {
      title: 'Transfers Configuration',
      description: 'Configure rail limits, transaction fees, and global rails.',
      statLabel: 'Global Config',
      statValue: 'Active',
      statVariant: 'emerald',
      href: '/admin/ebank/transfers',
      icon: ArrowRightLeft,
      color: 'sky',
    },
    {
      title: 'Bill Services',
      description: 'Setup, manage, and verify external billing institutions and clear customer payments.',
      statLabel: pendingBills > 0 ? 'Pending Settlement' : 'Total Payees',
      statValue: pendingBills > 0 ? pendingBills : totalPayees,
      statVariant: pendingBills > 0 ? 'amber' : 'emerald',
      href: '/admin/ebank/bill-services',
      icon: Receipt,
      color: 'emerald',
    },
    {
      title: 'Push Notifications',
      description: 'Broadcast urgent security notices and banking advisories.',
      statLabel: 'Unread by Users',
      statValue: unreadNotifications,
      statVariant: 'amber',
      href: '/admin/ebank/notifications',
      icon: Bell,
      color: 'amber',
    },
    {
      title: 'Support Inbox',
      description: 'Resolve customer assistance tickets and secure inquiries.',
      statLabel: 'Open Tickets',
      statValue: openTickets,
      statVariant: openTickets > 0 ? 'rose' : 'emerald',
      href: '/admin/ebank/support',
      icon: Headset,
      color: 'rose',
    },
  ];

  return (
    <AdminPageShell
      title="e-Bank Management Hub"
      subtitle="Comprehensive administrative control over digital banking services, credit underwriting, and client relationship perks."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col h-full hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-neutral-100 text-ink-900 rounded-xl">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-ink-900">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-3.5 mb-5 flex justify-between items-center border border-neutral-100">
                <span className="text-xs font-medium text-ink-900">{c.statLabel}</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    c.statVariant === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : c.statVariant === 'rose'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {c.statValue}
                </span>
              </div>

              <div className="mt-auto">
                <Link
                  href={c.href}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-neutral-300 rounded-md text-xs font-semibold text-ink-900 hover:bg-neutral-50 transition-colors"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AdminPageShell>
  );
}
