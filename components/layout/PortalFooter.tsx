import Link from "next/link";
import { Lock } from "lucide-react";
import { BRAND } from "@/src/content/facts";
import { ROUTES } from "@/lib/constants";

const LINKS = [
  { name: "Privacy notice", href: ROUTES.privacy },
  { name: "Terms of use", href: ROUTES.terms },
  { name: "Accessibility", href: ROUTES.accessibility },
  { name: "Security", href: ROUTES.security },
  { name: "Contact us", href: ROUTES.contact },
] as const;

/** Signed-in footer: the commercial site's legal line and links, nothing else. */
export function PortalFooter() {
  return (
    <footer className="border-t border-line bg-surface print:hidden">
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-3 px-4 py-6 md:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-caption font-semibold text-fg-muted">
          <Lock className="size-3.5" aria-hidden="true" />
          {BRAND.vault} · secure session
        </p>
        <nav aria-label="Legal and support">
          <ul className="flex flex-wrap gap-x-5">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-11 items-center text-caption text-fg-muted underline-offset-[3px] hover:text-fg hover:underline"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-caption text-fg-muted">
          {BRAND.fdicShort} Deposits are insured by the FDIC up to the maximum allowed by law.
        </p>
      </div>
    </footer>
  );
}
