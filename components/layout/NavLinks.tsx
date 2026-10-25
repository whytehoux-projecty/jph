"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PORTAL_NAV, PORTAL_NAV_SECONDARY, isActive, type NavItem } from "@/lib/portal-nav";

/**
 * The portal's full navigation list, shared by the desktop sidebar and the
 * mobile drawer so the two can never drift apart.
 */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col gap-6">
      {PORTAL_NAV.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-label uppercase text-fg-muted">{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={isActive(item, pathname)} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ul className="mt-auto flex flex-col gap-0.5 border-t border-line pt-4">
        {PORTAL_NAV_SECONDARY.map((item) => (
          <li key={item.href}>
            <NavLink item={item} active={isActive(item, pathname)} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-control px-3 text-small transition-colors duration-(--duration-fast)",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
        active
          ? "bg-surface-selected font-semibold text-fg before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-action"
          : "text-fg-muted hover:bg-surface-muted hover:text-fg",
      )}
    >
      <Icon className={cn("size-5 shrink-0", active ? "text-fg-action" : "text-fg-muted")} strokeWidth={1.75} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}
