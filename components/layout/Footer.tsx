import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Phone, Mail, MapPin, Lock } from 'lucide-react';
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
    if (isAbsolute || isSlim) {
        return (
            <footer
                className={cn(
                    "w-full bg-paper-100 mt-auto border-t border-paper-200",
                    isAbsolute
                        ? 'absolute bottom-0 left-0 right-0 z-20 pb-[calc(4rem+env(safe-area-inset-bottom))]'
                        : 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-8'
                )}
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pt-4">
                    {/* Secure Area Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-paper-200">
                        <div className="flex items-center gap-1.5 text-ink-900 font-semibold text-xs uppercase tracking-wider">
                            <Lock className="w-3.5 h-3.5 text-ink-600" /> Secure Area
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-ink-600">
                            <button className="hover:underline">En Español</button>
                            <span className="text-paper-300">|</span>
                            <button onClick={() => import('@/app/actions/auth').then(m => m.logoutAction())} className="hover:underline">Log out</button>
                        </div>
                    </div>

                    {/* Utility Links */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-6">
                        {[...footerSections.flatMap(s => s.links), ...legalLinks].slice(0, 12).map((link, i) => (
                            <Link 
                                key={i}
                                href={link.href}
                                className="text-[11px] text-ink-600 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-50"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <span className="text-[11px] text-ink-600 hover:underline cursor-pointer">AdChoices</span>
                    </div>

                    {/* Legal Disclaimers */}
                    <div className="space-y-4 text-[10px] text-ink-400 leading-relaxed max-w-6xl mx-auto text-center md:text-justify mb-8">
                        <p>
                            Investing involves risk. It is possible to lose money by investing in securities. You should review any planned financial transactions that may have tax or legal implications with your personal tax or legal advisor.
                        </p>
                        <p>
                            {BRAND.legalName} and its affiliates offer investment products sponsored, managed, distributed or provided by companies that are affiliates of {BRAND.legalName}. 
                        </p>
                        <p>
                            Bank products and services are offered by {BRAND.legalName}, N.A. and affiliated banks, Members FDIC and wholly owned subsidiaries of {BRAND.legalName} Corporation.
                        </p>
                        <p>
                            Investment products: <strong>Are Not FDIC Insured | Are Not Bank Guaranteed | May Lose Value</strong>
                        </p>
                        <p className="pt-4 text-center">
                            © {new Date().getFullYear()} {BRAND.legalName} Corporation. All rights reserved.
                        </p>
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
                                    inline-block transition-opacity hover:opacity-80
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-50
                                "
                            >
                                <img src="/images/logos/heritage-trust-logo.svg" alt="Heritage Trust Logo" className="h-7 w-auto" />
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
