import Link from "next/link";
import { Landmark, LockKeyhole, Timer } from "lucide-react";
import { BRAND } from "@/src/content/facts";
import { ROUTES } from "@/lib/constants";

/**
 * Layout for the sign-in and signed-out screens.
 *
 * Desktop: a photograph of the Heritage Trust building (the commercial
 * site's hero) with the bank's stated protections on a solid ink band
 * below it, beside a focused form column. Mobile: the form column only.
 *
 * Every statement on the brand panel is quoted from the commercial site's
 * Security page ("What we do, stated plainly"); the legal line is the
 * commercial site's FDIC line. Nothing here is invented.
 */

const PROTECTIONS = [
  {
    icon: Landmark,
    title: "Deposit insurance",
    body: "Deposits are insured by the FDIC up to $250,000 per depositor, for each account ownership category.",
  },
  {
    icon: LockKeyhole,
    title: "Encryption",
    body: `${BRAND.vault} sessions are encrypted with TLS, and sensitive data is encrypted when it is stored.`,
  },
  {
    icon: Timer,
    title: "Sign-in protection",
    body: `${BRAND.vault} signs you out after a short period of inactivity, so an unattended device does not stay open.`,
  },
] as const;

const LEGAL_LINKS = [
  { name: "Privacy notice", href: ROUTES.privacy },
  { name: "Terms of use", href: ROUTES.terms },
  { name: "Accessibility", href: ROUTES.accessibility },
  { name: "Security", href: ROUTES.security },
  { name: "Contact us", href: ROUTES.contact },
] as const;

export function AuthShell({ children, skipLabel = "Skip to sign in" }: { children: React.ReactNode; skipLabel?: string }) {
  return (
    <div className="grid min-h-dvh bg-surface text-fg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-skip-link) focus:bg-surface focus:px-4 focus:py-3 focus:text-small focus:font-semibold focus:text-fg focus:outline-2 focus:outline-focus"
      >
        {skipLabel}
      </a>

      {/* Brand panel — desktop only, purely supporting content */}
      <aside aria-label={`About ${BRAND.vault}`} className="hidden flex-col bg-surface-inverse text-fg-inverse lg:flex">
        <div className="relative min-h-0 flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero/hero-3-desktop.webp"
            alt="The limestone Heritage Trust building lit amber at dusk"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="border-t border-line-inverse px-10 py-10 xl:px-14">
          <p className="text-label uppercase text-fg-inverse-muted">How we protect you</p>
          <ul className="mt-6 grid gap-6 xl:grid-cols-3 xl:gap-8">
            {PROTECTIONS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3 xl:flex-col">
                <Icon className="mt-0.5 size-5 shrink-0 text-action-on-inverse" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <p className="text-small font-semibold text-fg-inverse">{title}</p>
                  <p className="mt-1 text-small text-fg-inverse-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href={ROUTES.security}
            className="mt-8 inline-flex min-h-11 items-center text-small font-semibold text-action-on-inverse underline decoration-1 underline-offset-[3px] hover:decoration-2 focus-visible:outline-focus-inverse"
          >
            Read how we keep your accounts secure
          </Link>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex min-h-dvh flex-col px-4 sm:px-8 xl:px-12">
        <header className="flex items-center justify-between gap-4 py-5">
          <Link href={ROUTES.home} className="inline-flex min-h-11 items-center" aria-label={`${BRAND.shortName} home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logos/heritage-trust-logo.svg" alt="" width={190} height={28} className="h-7 w-auto" />
          </Link>
          <Link
            href={ROUTES.home}
            className="inline-flex min-h-11 items-center text-small text-fg-muted underline-offset-[3px] hover:text-fg hover:underline"
          >
            <span className="sm:hidden">Website</span>
            <span className="hidden sm:inline">Back to {BRAND.shortName}</span>
          </Link>
        </header>

        <main id="auth-main" tabIndex={-1} className="mx-auto flex w-full max-w-(--container-form) flex-1 flex-col justify-center py-8 sm:py-12 focus:outline-none">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </main>

        <footer className="mx-auto w-full max-w-(--container-form) border-t border-line py-6">
          <nav aria-label="Legal and support">
            <ul className="flex flex-wrap gap-x-5">
              {LEGAL_LINKS.map((l) => (
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
          <p className="mt-2 text-caption text-fg-muted">
            {BRAND.fdicShort} Deposits are insured by the FDIC up to the maximum allowed by law.
          </p>
        </footer>
      </div>
    </div>
  );
}
