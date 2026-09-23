"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

const SEGMENT_LABELS: Record<string, string> = {
  ebank: 'e-Bank',
  'application-management': 'Application Management',
  'account-applications': 'Account Applications',
  'portal-requests': 'e-Portal Requests',
  'portal-users': 'e-Portal Users',
  'account-holders': 'Account Holders',
  'bill-services': 'Bill Services',
  transactions: 'Transactions',
  customers: 'Customers',
  settings: 'Settings',
  support: 'Support Helpdesk',
  notifications: 'Broadcasts & Alerts',
  active: 'Active Accounts',
  suspended: 'Suspended Accounts',
  deactivated: 'Deactivated Accounts',
  flagged: 'Flagged Accounts',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  if (!pathname) return null;

  const paths = pathname.split('/').filter(p => p !== '');
  // Ignore "admin" if it's the first one
  const breadcrumbs = paths.slice(paths[0] === 'admin' ? 1 : 0);

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      <Link href="/admin" className="hover:text-charcoal transition-colors font-medium">Admin</Link>
      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        const href = `/admin/${breadcrumbs.slice(0, idx + 1).join('/')}`;
        const label = SEGMENT_LABELS[crumb] || crumb.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        return (
          <Fragment key={href}>
            <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
            {isLast ? (
              <span className="font-semibold text-charcoal">{label}</span>
            ) : (
              <Link href={href} className="hover:text-charcoal transition-colors font-medium">{label}</Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
