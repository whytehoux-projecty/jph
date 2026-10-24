'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, RATES } from '@/src/content/facts';

/**
 * Header — one row (UI/UX review, "Layout and components").
 *
 * Logo · segment mega-menus · utilities and the one primary action at the
 * right. Replaces the old three stacked rows (domains, products, utility).
 * Every product has one URL, shared with the footer.
 */

type NavLink = { name: string; href: string; description: string };
type NavSegment = {
    name: string;
    href: string;
    intro: string;
    overview: string;
    links: NavLink[];
    feature?: { label: string; value?: string; note: string; href: string; cta: string };
};

const NAV: NavSegment[] = [
    {
        name: 'Personal',
        href: ROUTES.personalBanking,
        intro: 'Everyday accounts, savings and borrowing for you and your household.',
        overview: 'All personal banking',
        links: [
            { name: 'Checking', href: `${ROUTES.personalBanking}/checking`, description: 'Three settings, one account' },
            { name: 'Savings and CDs', href: `${ROUTES.personalBanking}/savings`, description: 'Variable and fixed-term savings' },
            { name: 'Credit cards', href: `${ROUTES.personalBanking}/credit-cards`, description: 'Heritage Rewards Visa®' },
            { name: 'Loans and mortgages', href: `${ROUTES.personalBanking}/loans`, description: 'Home, auto and personal loans' },
        ],
        feature: {
            label: 'Heritage Savings',
            value: `${RATES.savingsApy} APY`,
            note: `As of ${RATES.asOf}. Variable rate.`,
            href: ROUTES.ratesAndFees,
            cta: 'See all rates and fees',
        },
    },
    {
        name: 'Business',
        href: ROUTES.businessBanking,
        intro: 'Accounts, lending and payments sized to your business.',
        overview: 'All business banking',
        links: [
            { name: 'Business checking', href: `${ROUTES.businessBanking}/checking`, description: 'Operating accounts and cash flow' },
            { name: 'Savings and CDs', href: `${ROUTES.businessBanking}/savings`, description: 'Reserves and fixed terms' },
            { name: 'Business credit cards', href: `${ROUTES.businessBanking}/credit-cards`, description: 'Cards with employee limits' },
            { name: 'Loans and financing', href: `${ROUTES.businessBanking}/loans`, description: 'Lines of credit, SBA and equipment' },
            { name: 'Merchant services', href: `${ROUTES.businessBanking}/merchant`, description: 'Card acceptance and next-day funding' },
        ],
        feature: {
            label: 'Talk to a business banker',
            note: 'A named banker for your business, from the first call.',
            href: `${ROUTES.contact}?topic=business`,
            cta: 'Arrange a call',
        },
    },
    {
        name: 'Wealth',
        href: '/wealth',
        intro: 'Advice, trusts and portfolio management through one adviser.',
        overview: 'All wealth management',
        links: [
            { name: 'Private wealth', href: '/wealth/private', description: 'A dedicated private wealth adviser' },
            { name: 'Trust services', href: '/wealth/trust', description: 'Corporate trustee and administration' },
            { name: 'Estate planning', href: '/wealth/estate', description: 'Structuring what you pass on' },
            { name: 'Portfolio management', href: '/wealth/portfolio', description: 'Discretionary and advisory mandates' },
        ],
        feature: {
            label: 'Relationships from',
            value: '$250,000',
            note: 'Three service tiers, each with a named adviser.',
            href: '/wealth#tiers',
            cta: 'Compare service tiers',
        },
    },
    {
        name: 'Corporate',
        href: '/corporate',
        intro: 'Banking, treasury and markets for corporations and institutions.',
        overview: 'Corporations and institutions',
        links: [
            { name: 'Commercial banking', href: '/corporate/commercial', description: 'Mid-sized companies' },
            { name: 'Global corporate banking', href: '/corporate/global', description: 'Multinationals and cross-border' },
            { name: 'Treasury services', href: '/corporate/treasury', description: 'Liquidity, payments and trade' },
            { name: 'Capital markets', href: '/corporate/capital', description: 'Debt and equity for issuers' },
        ],
    },
    {
        name: 'About us',
        href: ROUTES.about,
        intro: 'Who we are, how we are run and how we keep your money safe.',
        overview: `About ${BRAND.shortName}`,
        links: [
            { name: 'Our history', href: `${ROUTES.about}#history`, description: `Banking since ${BRAND.founded}` },
            { name: 'Leadership', href: `${ROUTES.about}#leadership`, description: 'The executive team' },
            { name: 'Transparency', href: '/transparency', description: 'Figures, policies and documents' },
            { name: 'Security', href: ROUTES.security, description: 'How to verify it’s really us' },
            { name: 'Contact and locations', href: ROUTES.contact, description: 'Reach a person' },
        ],
    },
];

export function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [mobileSection, setMobileSection] = useState<string | null>(null);
    const pathname = usePathname();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const signInHref = isLoggedIn ? ROUTES.dashboard : ROUTES.login;
    const signInLabel = isLoggedIn ? 'Go to Heritage Vault' : 'Sign in';

    // Close menus on route change
    useEffect(() => {
        setMobileOpen(false);
        setOpenMenu(null);
    }, [pathname]);

    // Desktop mega-menu: Escape and outside click close it
    useEffect(() => {
        if (!openMenu) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                const trigger = document.getElementById(`nav-trigger-${slug(openMenu)}`);
                setOpenMenu(null);
                trigger?.focus();
            }
        };
        const onClick = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
        };
    }, [openMenu]);

    // Focus trap in mobile menu
    useEffect(() => {
        if (!mobileOpen) return;

        const menu = mobileMenuRef.current;
        if (!menu) return;

        const getFocusable = () =>
            menu.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileOpen(false);
                menuButtonRef.current?.focus();
                return;
            }
            if (e.key !== 'Tab') return;
            const focusable = getFocusable();
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        getFocusable()[0]?.focus();
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const isActive = useCallback(
        (href: string) => {
            const path = href.split('#')[0].split('?')[0];
            return pathname === path || pathname.startsWith(path + '/');
        },
        [pathname],
    );

    const segmentActive = (seg: NavSegment) =>
        isActive(seg.href) || seg.links.some((l) => !l.href.includes('#') && isActive(l.href));

    const openWithDelay = (name: string | null) => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setOpenMenu(name), name ? 80 : 160);
    };

    const activePanel = NAV.find((s) => s.name === openMenu);

    return (
        <>
            <header className="sticky top-0 z-50 bg-paper-50 border-b border-paper-200">
                <div ref={navRef} onMouseLeave={() => openWithDelay(null)}>
                    <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8 h-[72px]">
                        {/* Wordmark */}
                        <Link
                            href={ROUTES.home}
                            aria-label={`${BRAND.shortName} — home`}
                            className="flex shrink-0 items-center"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/logos/heritage-trust-logo.svg" alt="" className="h-7 w-auto" width={190} height={28} />
                        </Link>

                        {/* Desktop segments */}
                        <nav aria-label="Main" className="hidden lg:block h-full">
                            <ul className="flex h-full items-stretch gap-1">
                                {NAV.map((seg) => {
                                    const expanded = openMenu === seg.name;
                                    const active = segmentActive(seg);
                                    return (
                                        <li key={seg.name} className="flex" onMouseEnter={() => openWithDelay(seg.name)}>
                                            <button
                                                id={`nav-trigger-${slug(seg.name)}`}
                                                type="button"
                                                aria-expanded={expanded}
                                                aria-controls="nav-panel"
                                                onClick={() => setOpenMenu(expanded ? null : seg.name)}
                                                className={`
                                                    relative inline-flex items-center gap-1.5 px-3 text-small font-semibold transition-colors
                                                    ${expanded || active ? 'text-petrol' : 'text-ink-900 hover:text-petrol'}
                                                `}
                                            >
                                                {seg.name}
                                                <ChevronDown
                                                    className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                                                    aria-hidden="true"
                                                />
                                                {active && (
                                                    <span className="absolute inset-x-3 bottom-0 h-0.5 bg-petrol" aria-hidden="true" />
                                                )}
                                                {active && <span className="sr-only"> (current section)</span>}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* Utilities + one primary action */}
                        <div className="ml-auto hidden lg:flex items-center gap-2">
                            <Link
                                href={ROUTES.contact}
                                className="hidden xl:inline-flex min-h-11 items-center px-3 text-small text-ink-700 hover:text-petrol transition-colors"
                            >
                                Contact
                            </Link>
                            <Link
                                href={signInHref}
                                className="inline-flex items-center px-3 text-small font-semibold text-ink-900 hover:text-petrol transition-colors"
                            >
                                {signInLabel}
                                <span aria-hidden="true" className="ml-1">↗</span>
                            </Link>
                            <Link
                                href={ROUTES.apply}
                                className="inline-flex items-center justify-center whitespace-nowrap px-5 bg-petrol text-white text-small font-semibold hover:bg-petrol-700 transition-colors"
                            >
                                Open an account
                            </Link>
                        </div>

                        {/* Mobile */}
                        <div className="ml-auto flex items-center gap-1 lg:hidden">
                            <Link
                                href={signInHref}
                                className="inline-flex items-center px-3 text-small font-semibold text-ink-900"
                            >
                                {signInLabel}
                            </Link>
                            <button
                                ref={menuButtonRef}
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open menu"
                                aria-expanded={mobileOpen}
                                aria-controls="mobile-menu"
                                className="inline-flex h-11 w-11 items-center justify-center border border-paper-200 text-ink-900"
                            >
                                <Menu className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop mega-menu panel */}
                    {activePanel && (
                    <div
                        id="nav-panel"
                        className="absolute inset-x-0 top-full hidden lg:block border-b border-paper-200 bg-paper-50"
                        onMouseEnter={() => hoverTimer.current && clearTimeout(hoverTimer.current)}
                    >
                            <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-8 py-10 animate-fade-in">
                                <div className="col-span-3 border-r border-paper-200 pr-8">
                                    <p className="ht-label text-ink-500 mb-3">{activePanel.name}</p>
                                    <p className="text-body text-ink-700 mb-6">{activePanel.intro}</p>
                                    <Link
                                        href={activePanel.href}
                                        className="inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4"
                                    >
                                        {activePanel.overview}
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                                <ul className={`${activePanel.feature ? 'col-span-6' : 'col-span-9'} grid grid-cols-2 gap-x-8 content-start`}>
                                    {activePanel.links.map((link) => (
                                        <li key={link.href} className="border-b border-paper-200">
                                            <Link
                                                href={link.href}
                                                aria-current={isActive(link.href) && !link.href.includes('#') ? 'page' : undefined}
                                                className="group block py-3"
                                            >
                                                <span className="block text-body font-semibold text-ink-900 group-hover:text-petrol group-aria-[current=page]:text-petrol">
                                                    {link.name}
                                                </span>
                                                <span className="block text-small text-ink-500">{link.description}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                {activePanel.feature && (
                                    <div className="col-span-3 bg-paper-100 p-6">
                                        <p className="ht-label text-ink-500 mb-2">{activePanel.feature.label}</p>
                                        {activePanel.feature.value && (
                                            <p className="text-figure font-light text-ink-900 tabular mb-1">
                                                {activePanel.feature.value}
                                            </p>
                                        )}
                                        <p className="text-small text-ink-500 mb-4">{activePanel.feature.note}</p>
                                        <Link
                                            href={activePanel.feature.href}
                                            className="inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4"
                                        >
                                            {activePanel.feature.cta}
                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                    </div>
                    )}
                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-ink-900/50"
                        aria-hidden="true"
                        onClick={() => {
                            setMobileOpen(false);
                            menuButtonRef.current?.focus();
                        }}
                    />

                    <div
                        id="mobile-menu"
                        ref={mobileMenuRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu"
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-l border-paper-200 bg-paper-50"
                    >
                        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-paper-200 px-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/logos/heritage-trust-logo.svg" alt={BRAND.shortName} className="h-6 w-auto" />
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileOpen(false);
                                    menuButtonRef.current?.focus();
                                }}
                                aria-label="Close menu"
                                className="inline-flex h-11 w-11 items-center justify-center border border-paper-200 text-ink-900"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        <nav aria-label="Main" className="px-4">
                            <ul>
                                {NAV.map((seg) => {
                                    const expanded = mobileSection === seg.name;
                                    return (
                                        <li key={seg.name} className="border-b border-paper-200">
                                            <button
                                                type="button"
                                                aria-expanded={expanded}
                                                aria-controls={`m-${slug(seg.name)}`}
                                                onClick={() => setMobileSection(expanded ? null : seg.name)}
                                                className={`flex w-full items-center justify-between py-3 text-body font-semibold ${segmentActive(seg) ? 'text-petrol' : 'text-ink-900'}`}
                                            >
                                                {seg.name}
                                                <ChevronDown
                                                    className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                            <ul id={`m-${slug(seg.name)}`} hidden={!expanded} className="pb-3">
                                                <li>
                                                    <Link href={seg.href} className="flex items-center py-2 pl-3 text-small font-semibold text-petrol">
                                                        {seg.overview}
                                                    </Link>
                                                </li>
                                                {seg.links.map((link) => (
                                                    <li key={link.href}>
                                                        <Link
                                                            href={link.href}
                                                            aria-current={isActive(link.href) && !link.href.includes('#') ? 'page' : undefined}
                                                            className="flex items-center border-l border-paper-200 py-2 pl-3 text-small text-ink-700 aria-[current=page]:border-petrol aria-[current=page]:text-ink-900 aria-[current=page]:font-semibold"
                                                        >
                                                            {link.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    );
                                })}
                                <li className="border-b border-paper-200">
                                    <Link href={ROUTES.contact} className="flex items-center py-3 text-body text-ink-900">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="mt-auto space-y-3 border-t border-paper-200 p-4">
                            <Link
                                href={ROUTES.apply}
                                className="flex w-full items-center justify-center bg-petrol px-6 text-small font-semibold text-white hover:bg-petrol-700"
                            >
                                Open an account
                            </Link>
                            <Link
                                href={signInHref}
                                className="flex w-full items-center justify-center border border-ink-900 px-6 text-small font-semibold text-ink-900 hover:bg-paper-100"
                            >
                                {isLoggedIn ? 'Go to Heritage Vault' : 'Sign in to Heritage Vault'}
                            </Link>
                            <p className="pt-2 text-xs text-ink-500 text-center">{BRAND.fdicShort}</p>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function slug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
