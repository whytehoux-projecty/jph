import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PageHeader — docs/DESIGN_SYSTEM.md#page-header
 * Every signed-in page opens with one: the page's single h1, an optional
 * breadcrumb (for pages two or more levels deep), a short description and
 * at most one primary action plus secondary actions.
 */
export interface Crumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: Crumb[];
  /** Buttons, primary last (it sits on the right on desktop). */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-small text-fg-muted">
              {breadcrumb.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5" aria-hidden="true" />}
                  {c.href && i < breadcrumb.length - 1 ? (
                    <Link href={c.href} className="underline-offset-[3px] hover:text-fg hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current={i === breadcrumb.length - 1 ? "page" : undefined}>{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="font-display text-h1 text-fg">{title}</h1>
        {description && <p className="mt-1 text-body text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
