import Link from "next/link";
import { ArrowDownToLine, ArrowLeftRight, FileText, Receipt, type LucideIcon } from "lucide-react";

/** Shortcuts to the existing money-movement and document routes. */
const ACTIONS: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Transfer money", href: "/transfer", icon: ArrowLeftRight },
  { label: "Pay a bill", href: "/bills", icon: Receipt },
  { label: "Deposit", href: "/deposit", icon: ArrowDownToLine },
  { label: "Statements", href: "/statements", icon: FileText },
];

export function QuickActions() {
  return (
    <nav aria-label="Quick actions">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-20 flex-col items-start justify-between gap-3 rounded-surface border border-line bg-surface p-4 text-small font-semibold text-fg transition-colors duration-(--duration-fast) hover:border-line-strong hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Icon className="size-5 text-fg-action" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
