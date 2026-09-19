"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

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
        const label = crumb.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
