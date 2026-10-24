"use client";

import Link from "next/link";
import { LifeBuoy, Menu } from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter";
import { UserMenu } from "./UserMenu";
import { StaffViewBanner } from "./StaffViewBanner";
import type { StaffViewState } from "@/app/actions/staff-view";
import type { PortalProfile } from "./types";

/**
 * Sticky top bar. Mobile: menu button and logo on the left. Desktop: the
 * sidebar carries the logo, so the bar holds only the utilities.
 */
export function AppTopBar({
  profile,
  staffView = null,
  onOpenMenu,
}: {
  profile: PortalProfile | null;
  staffView?: StaffViewState | null;
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-(--z-header) border-b border-line bg-surface">
      {staffView && <StaffViewBanner state={staffView} />}
      <div className="flex h-16 items-center gap-2 px-2 sm:px-4 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex size-11 items-center justify-center rounded-control text-fg hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus lg:hidden"
        >
          <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <Link href="/dashboard" aria-label="Heritage Vault overview" className="inline-flex min-h-11 items-center lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/heritage-trust-logo.svg" alt="" width={150} height={22} className="h-5 w-auto sm:h-6" />
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/support"
            className="hidden min-h-11 items-center gap-2 rounded-control px-3 text-small font-semibold text-fg hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:inline-flex"
          >
            <LifeBuoy className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Help
          </Link>
          <NotificationCenter />
          <UserMenu profile={profile} staffView={!!staffView} />
        </div>
      </div>
    </header>
  );
}
