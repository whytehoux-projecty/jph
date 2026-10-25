import {
  ArrowDownToLine,
  ArrowLeftRight,
  CreditCard,
  FileText,
  Handshake,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  List,
  PiggyBank,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Portal navigation — one definition for the desktop sidebar, the mobile
 * drawer and the mobile tab bar. Every entry is an existing route.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Other path prefixes that should mark this item active. */
  match?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const PORTAL_NAV: NavGroup[] = [
  {
    label: "Banking",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Accounts", href: "/vaults", icon: Landmark, match: ["/accounts"] },
      { label: "Cards", href: "/cards", icon: CreditCard },
      { label: "Activity", href: "/activities", icon: List, match: ["/transaction", "/transactions"] },
      { label: "Statements", href: "/statements", icon: FileText },
    ],
  },
  {
    label: "Move money",
    items: [
      { label: "Transfers", href: "/transfer", icon: ArrowLeftRight },
      { label: "Pay bills", href: "/bills", icon: Receipt },
      { label: "Payees", href: "/beneficiaries", icon: Users },
      { label: "Deposit & withdraw", href: "/deposit", icon: ArrowDownToLine },
    ],
  },
  {
    label: "Grow",
    items: [
      { label: "Savings & loans", href: "/savings", icon: PiggyBank },
      { label: "Your relationship", href: "/relationship", icon: Handshake, match: ["/benefits", "/rewards"] },
    ],
  },
];

export const PORTAL_NAV_SECONDARY: NavItem[] = [
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** The four destinations on the mobile tab bar; the fifth tab opens the menu. */
export const MOBILE_TABS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/vaults", icon: Landmark, match: ["/accounts", "/cards"] },
  { label: "Pay", href: "/transfer", icon: ArrowLeftRight, match: ["/bills", "/beneficiaries"] },
  { label: "Activity", href: "/activities", icon: List, match: ["/transaction", "/transactions", "/statements"] },
];

export function isActive(item: NavItem, pathname: string | null): boolean {
  if (!pathname) return false;
  return [item.href, ...(item.match ?? [])].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Label of the nav item that owns the current path (for the mobile header). */
export function currentSectionLabel(pathname: string | null): string | null {
  for (const group of PORTAL_NAV) {
    const hit = group.items.find((i) => isActive(i, pathname));
    if (hit) return hit.label;
  }
  return PORTAL_NAV_SECONDARY.find((i) => isActive(i, pathname))?.label ?? null;
}
