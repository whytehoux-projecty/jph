import Link from "next/link";
import { NavLinks } from "./NavLinks";

/** Desktop navigation (lg and up). Fixed to the left edge; the page scrolls beside it. */
export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-(--z-header) hidden w-64 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-6">
        <Link href="/dashboard" aria-label="Heritage Vault overview" className="inline-flex min-h-11 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/heritage-trust-logo.svg" alt="" width={163} height={24} className="h-6 w-auto" />
        </Link>
      </div>
      <nav aria-label="Main" className="flex flex-1 flex-col overflow-y-auto px-3 py-6">
        <NavLinks />
      </nav>
    </aside>
  );
}
