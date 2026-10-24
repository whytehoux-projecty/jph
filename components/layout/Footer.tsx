import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Lock, ShieldCheck } from 'lucide-react';
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

// ─── Slim (portal) footer links — unchanged ───────────────────────────────────
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
