import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { ROUTES, BANK_INFO } from '@/lib/constants';
import { BRAND, yearsOfService } from '@/src/content/facts';

// ─── Nav columns ──────────────────────────────────────────────────────────────
const footerSections = [
    {
        heading: 'Personal',
        links: [
            { name: 'Heritage Checking', href: `${ROUTES.personalBanking}#checking` },
            { name: 'Heritage Savings', href: `${ROUTES.personalBanking}#savings` },
            { name: 'Heritage Rewards Visa®', href: `${ROUTES.personalBanking}#card` },
            { name: 'Personal Loans', href: `${ROUTES.personalBanking}#loans` },
            { name: 'Mortgages', href: `${ROUTES.personalBanking}#mortgages` },
        ],
    },
    {
        heading: 'Business',
        links: [
            { name: 'Business Checking', href: `${ROUTES.businessBanking}#checking` },
            { name: 'Merchant Services', href: `${ROUTES.businessBanking}#merchant` },
            { name: 'Business Lending', href: `${ROUTES.businessBanking}#lending` },
            { name: 'Payroll', href: `${ROUTES.businessBanking}#payroll` },
            { name: 'Treasury Management', href: `${ROUTES.businessBanking}#treasury` },
        ],
    },
    {
        heading: 'Online Banking',
        links: [
            { name: 'Sign in to Heritage Vault', href: ROUTES.login },
            { name: 'Open an account', href: ROUTES.apply },
            { name: 'Get online access', href: ROUTES.enroll },
            { name: 'Check application status', href: ROUTES.status },
            { name: 'Rates & Fees', href: ROUTES.ratesAndFees },
        ],
    },
    {
        heading: 'Company',
        links: [
            { name: 'About Heritage Trust', href: ROUTES.about },
            { name: 'Our leadership', href: `${ROUTES.about}#leadership` },
            { name: 'Contact us', href: ROUTES.contact },
            { name: 'Locations', href: ROUTES.locations },
            { name: 'Careers', href: ROUTES.careers },
            { name: 'Press', href: ROUTES.press },
        ],
    },
];

const legalLinks = [
    { name: 'Privacy Policy', href: ROUTES.privacy },
    { name: 'Terms of Use', href: ROUTES.terms },
    { name: 'Accessibility', href: ROUTES.accessibility },
    { name: 'Security', href: ROUTES.security },
];

export function Footer({ isAbsolute, isSlim }: { isAbsolute?: boolean; isSlim?: boolean } = {}) {
    // Slim footer variant — used inside portal layout
    if (isAbsolute || isSlim) {
        return (
            <footer
                className={
                    isAbsolute
                        ? 'absolute bottom-0 left-0 right-0 z-20 theme-ink py-3 pb-[calc(4rem+env(safe-area-inset-bottom))]'
                        : 'w-full theme-ink py-4 mt-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-4'
                }
                style={{ background: 'var(--bg)' }}
            >
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl">
                    <p className="text-[11px] text-ink-500 text-center" style={{ color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} {BRAND.legalName} All rights reserved. {BRAND.fdic}
                        {' · '}
                        <a href={`tel:${BRAND.phoneTel}`} className="whitespace-nowrap hover:underline">
                            {BRAND.phoneDisplay}
                        </a>
                    </p>
                    <div className="flex gap-4">
                        {legalLinks.map((l) => (
                            <a
                                key={l.name}
                                href={l.href}
                                className="text-[11px] hover:underline transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {l.name}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        );
    }

    // Full footer — marketing site
    return (
        <footer className="theme-ink" style={{ background: 'var(--bg)' }}>
            {/* Main footer grid */}
            <div className="container mx-auto px-6 py-16 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Wordmark */}
                        <div>
                            <Link
                                href={ROUTES.home}
                                aria-label={`${BRAND.shortName} — Home`}
                                className="
                                    font-display font-semibold tracking-tight
                                    transition-colors hover:text-vermilion-400
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-50
                                "
                                style={{ fontSize: '1.25rem', color: 'var(--text)' }}
                            >
                                {BRAND.shortName}
                            </Link>
                            <p className="label-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                                Trusted since {BRAND.founded}
                            </p>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', maxWidth: '28ch' }}>
                            Serving families, businesses, and institutions for{' '}
                            {yearsOfService()} years. Member FDIC.
                        </p>

                        {/* Contact info — no social icons (no real profiles) */}
                        <div className="space-y-3">
                            <a
                                href={`tel:${BRAND.phoneTel}`}
                                className="flex items-center gap-3 text-small hover:underline transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                                {BRAND.phoneDisplay}
                            </a>
                            <a
                                href={`mailto:${BRAND.email}`}
                                className="flex items-center gap-3 text-small hover:underline transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                                {BRAND.email}
                            </a>
                            <div className="flex items-start gap-3 text-small" style={{ color: 'var(--text-muted)' }}>
                                <MapPin className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                                {BRAND.address}
                            </div>
                        </div>
                    </div>

                    {/* Nav columns */}
                    {footerSections.map((section) => (
                        <div key={section.heading} className="space-y-4">
                            <h3 className="label-mono" style={{ color: 'var(--text-muted)' }}>
                                {section.heading}
                            </h3>
                            <ul className="space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-small transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-50"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t" style={{ borderColor: 'var(--line)' }}>
                <div className="container mx-auto px-6 py-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-small text-center md:text-left" style={{ color: 'var(--text-muted)' }}>
                            © {new Date().getFullYear()} {BRAND.legalName} All rights reserved.
                            {' '}{BRAND.fdic}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 justify-center">
                            {legalLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-small hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-50"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
