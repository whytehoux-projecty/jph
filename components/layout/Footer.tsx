import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, PUBLIC_CONTACT } from '@/src/content/facts';
import { CookieSettingsLink } from '@/components/commercial/ConsentBanner';

// ─── Marketing footer columns — one URL per product, shared with the header ───
const siteSections = [
    {
        heading: 'Personal',
        links: [
            { name: 'Checking', href: `${ROUTES.personalBanking}/checking` },
            { name: 'Savings and CDs', href: `${ROUTES.personalBanking}/savings` },
            { name: 'Heritage Rewards Visa®', href: `${ROUTES.personalBanking}/credit-cards` },
            { name: 'Loans and mortgages', href: `${ROUTES.personalBanking}/loans` },
            { name: 'Account Finder', href: '/account-finder' },
        ],
    },
    {
        heading: 'Business',
        links: [
            { name: 'Business checking', href: `${ROUTES.businessBanking}/checking` },
            { name: 'Merchant services', href: `${ROUTES.businessBanking}/merchant` },
            { name: 'Loans and financing', href: `${ROUTES.businessBanking}/loans` },
            { name: 'Treasury services', href: '/corporate/treasury' },
            { name: 'Corporations and institutions', href: '/corporate' },
        ],
    },
    {
        heading: 'Online banking',
        links: [
            { name: 'Sign in to Heritage Vault', href: ROUTES.login },
            { name: 'Open an account', href: ROUTES.apply },
            { name: 'Get online access', href: ROUTES.enroll },
            { name: 'Check application status', href: ROUTES.status },
            { name: 'Rates and fees', href: ROUTES.ratesAndFees },
        ],
    },
    {
        heading: 'Company',
        links: [
            { name: `About ${BRAND.shortName}`, href: ROUTES.about },
            { name: 'Leadership', href: `${ROUTES.about}#leadership` },
            { name: 'Transparency', href: '/transparency' },
            { name: 'Contact and locations', href: ROUTES.contact },
            { name: 'Careers', href: ROUTES.careers },
            { name: 'Press', href: ROUTES.press },
        ],
    },
];

const siteLegalLinks = [
    { name: 'Privacy notice', href: ROUTES.privacy },
    { name: 'Terms of use', href: ROUTES.terms },
    { name: 'Accessibility', href: ROUTES.accessibility },
    { name: 'Security', href: ROUTES.security },
];

/** Marketing-site footer. The signed-in portal uses PortalFooter. */
export function Footer() {
    // Full footer — marketing site
    return (
        <footer className="ht-dark border-t border-ink-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Brand and the verify-it's-us panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href={ROUTES.home} aria-label={`${BRAND.shortName} — home`} className="inline-flex items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/logos/heritage-trust-logo-reversed.svg" alt="" className="h-7 w-auto" />
                        </Link>

                        <div className="border border-white/25 p-5">
                            <p className="flex items-center gap-2 text-body font-semibold text-white">
                                <ShieldCheck className="h-5 w-5 text-sea-glass" aria-hidden="true" />
                                Is it really us?
                            </p>
                            <p className="mt-2 text-small" style={{ color: 'var(--text-muted)' }}>
                                We never ask for your password, PIN or one-time code, and we never ask you to move money
                                to a &ldquo;safe account&rdquo; by phone, text or email.
                            </p>
                            <Link
                                href={`${ROUTES.security}#verify`}
                                className="mt-3 inline-flex items-center text-small font-semibold text-sea-glass underline underline-offset-4"
                            >
                                Verify a call, email or website
                            </Link>
                        </div>

                        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-small">
                            <dt style={{ color: 'var(--text-muted)' }}>Phone</dt>
                            <dd className="text-white">{PUBLIC_CONTACT.phone}</dd>
                            <dt style={{ color: 'var(--text-muted)' }}>Email</dt>
                            <dd className="text-white">{PUBLIC_CONTACT.email}</dd>
                            <dt style={{ color: 'var(--text-muted)' }}>Head office</dt>
                            <dd className="text-white">{PUBLIC_CONTACT.address}</dd>
                        </dl>
                    </div>

                    {/* Columns — plain labels, not headings, so the outline stays clean */}
                    <nav aria-label="Footer" className="lg:col-span-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
                        {siteSections.map((section) => (
                            <div key={section.heading}>
                                <p className="ht-label mb-3" style={{ color: 'var(--text-muted)' }}>
                                    {section.heading}
                                </p>
                                <ul>
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="flex items-center text-small text-white hover:text-sea-glass hover:underline underline-offset-4"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Legal floor */}
            <div className="border-t" style={{ borderColor: 'var(--line)' }}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
                    <p className="text-xs leading-relaxed ht-measure" style={{ color: 'var(--text-muted)' }}>
                        {BRAND.shortName} is the trading name of {BRAND.legalEntity}. Member FDIC. Deposits are insured by
                        the FDIC up to the maximum allowed by law. Equal Housing Lender. Investment products are not FDIC
                        insured, are not bank guaranteed and may lose value.
                    </p>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            © {new Date().getFullYear()} {BRAND.legalEntity}. All rights reserved.
                        </p>
                        <ul className="flex flex-wrap items-center gap-x-5">
                            {siteLegalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex items-center text-small text-white hover:text-sea-glass hover:underline underline-offset-4"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <CookieSettingsLink className="inline-flex items-center text-small text-white hover:text-sea-glass hover:underline underline-offset-4" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
