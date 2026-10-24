"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_TABS, isActive } from "@/lib/portal-nav";

const tabClass =
  "relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-caption transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

/** Phone tab bar: four destinations within thumb reach, plus the full menu. */
export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Shortcuts"
      className="fixed inset-x-0 bottom-0 z-(--z-header) border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex h-16 items-stretch">
        {MOBILE_TABS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(tabClass, active ? "font-semibold text-fg" : "text-fg-muted hover:text-fg")}
              >
                {active && <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 bg-action" />}
                <Icon className={cn("size-5", active && "text-fg-action")} strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onOpenMenu} className={cn(tabClass, "text-fg-muted hover:text-fg")}>
            <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
            Menu
          </button>
        </li>
      </ul>
    </nav>
  );
}
