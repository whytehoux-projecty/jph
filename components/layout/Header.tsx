'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { ROUTES, BANK_INFO } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';

const NAV_ITEMS = [
    {
        name: 'Personal',
        href: ROUTES.personalBanking,
        subItems: [
            { name: 'Checking', href: `${ROUTES.personalBanking}/checking` },
            { name: 'Savings & CDs', href: `${ROUTES.personalBanking}/savings` },
            { name: 'Credit Cards', href: `${ROUTES.personalBanking}/credit-cards` },
            { name: 'Loans & Mortgages', href: `${ROUTES.personalBanking}/loans` },
        ],
    },
    {
        name: 'Business',
        href: ROUTES.businessBanking,
        subItems: [
            { name: 'Small Business Checking', href: `${ROUTES.businessBanking}/checking` },
            { name: 'Savings & CDs', href: `${ROUTES.businessBanking}/savings` },
            { name: 'Business Credit Cards', href: `${ROUTES.businessBanking}/credit-cards` },
            { name: 'Loans & Financing', href: `${ROUTES.businessBanking}/loans` },
            { name: 'Merchant Services', href: `${ROUTES.businessBanking}/merchant` },
        ],
    },
    {
        name: 'Wealth Management',
        href: '/wealth',
        subItems: [
            { name: 'Private Wealth', href: '/wealth/private' },
            { name: 'Trust Services', href: '/wealth/trust' },
            { name: 'Estate Planning', href: '/wealth/estate' },
            { name: 'Portfolio Management', href: '/wealth/portfolio' },
        ],
    },
    {
        name: 'Corporations & Institutions',
        href: '/corporate',
        subItems: [
            { name: 'Commercial Banking', href: '/corporate/commercial' },
            { name: 'Global Corporate Banking', href: '/corporate/global' },
            { name: 'Treasury Services', href: '/corporate/treasury' },
            { name: 'Capital Markets', href: '/corporate/capital' },
        ],
    },
    {
        name: 'About',
        href: ROUTES.about,
    },
];

export function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeHash, setActiveHash] = useState('');
    const pathname = usePathname();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setActiveHash(window.location.hash);
        const handleHashChange = () => setActiveHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);

        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Focus trap in mobile menu
    useEffect(() => {
        if (!mobileOpen) return;

        const menu = mobileMenuRef.current;
        if (!menu) return;

        const focusable = menu.querySelectorAll<HTMLElement>(
            'a, button, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileOpen(false);
                menuButtonRef.current?.focus();
                return;
            }
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        // Move focus into menu
        first?.focus();
        document.addEventListener('keydown', handleKeyDown);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const isActive = useCallback(
        (href: string) => pathname === href || pathname.startsWith(href + '/'),
        [pathname],
    );

    const isSubItemActive = useCallback(
        (href: string) => {
            const [path, hash] = href.split('#');
            const isPathActive = pathname === path || pathname.startsWith(path + '/');
            if (hash) {
                return isPathActive && activeHash === `#${hash}`;
            }
            return isPathActive && (!activeHash || activeHash === '');
        },
        [pathname, activeHash]
    );

    const handleSubItemClick = (href: string) => {
        const hash = href.split('#')[1];
        setActiveHash(hash ? `#${hash}` : '');
        setMobileOpen(false);
    };

    const getActiveDomain = () => {
        if (pathname.startsWith(ROUTES.businessBanking)) return NAV_ITEMS[1];
        if (pathname.startsWith('/wealth')) return NAV_ITEMS[2];
        if (pathname.startsWith('/corporate')) return NAV_ITEMS[3];
        if (pathname.startsWith(ROUTES.about)) return NAV_ITEMS[4];
        return NAV_ITEMS[0]; // Default to Personal
    };
    
    const activeDomain = getActiveDomain();

    return (
        <>
        <header
            className={`sticky top-0 z-50 transition-colors duration-200 ${
                scrolled ? 'bg-paper-50/95 shadow-sm' : 'bg-paper-50'
            } backdrop-blur-md`}
        >
            {/* TOP BAR (Domains & Utility) */}
            <div className="bg-ink-900 text-paper-50 hidden lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
                    {/* Domains */}
                    <div className="flex">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    px-5 py-2.5 text-xs font-semibold transition-colors
                                    ${activeDomain.name === item.name 
                                        ? 'bg-paper-50 text-ink-900' 
                                        : 'text-ink-300 hover:text-white hover:bg-ink-800'
                                    }
                                `}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    {/* Utility */}
                    <div className="flex gap-6 items-center">
                        <Link href={ROUTES.locations} className="text-xs font-medium text-ink-300 hover:text-white transition-colors">Locations</Link>
                        <Link href={ROUTES.contact} className="text-xs font-medium text-ink-300 hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR (Logo, Sub-items, CTA) */}
            <nav
                aria-label="Main navigation"
                className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8 border-b border-paper-200"
            >
                {/* Wordmark */}
                <div className="flex flex-shrink-0 mr-8">
                    <Link
                        href={ROUTES.home}
                        aria-label={`${BRAND.shortName} — Home`}
                        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
                    >
                        <img src="/images/logos/heritage-trust-logo.svg" alt="Heritage Trust Logo" className="h-7 w-auto" />
                    </Link>
                </div>

                {/* Desktop Sub-items (Products of active domain) */}
                <div className="hidden lg:flex lg:flex-1 lg:gap-x-6 lg:items-center" role="list">
                    {activeDomain.subItems && activeDomain.subItems.length > 0 && (
                        activeDomain.subItems.map((sub) => (
                            <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => handleSubItemClick(sub.href)}
                                className={`text-sm font-medium transition-colors whitespace-nowrap px-1 py-1 border-b-2 ${
                                    isSubItemActive(sub.href)
                                        ? 'border-vermilion-600 text-vermilion-600'
                                        : 'border-transparent text-ink-700 hover:text-vermilion-600'
                                }`}
                            >
                                {sub.name}
                            </Link>
                        ))
                    )}
                </div>

                {/* Desktop CTA row */}
                <div className="hidden lg:flex flex-shrink-0 lg:gap-4 lg:items-center ml-4">
                    <Link
                        href={isLoggedIn ? ROUTES.dashboard : ROUTES.login}
                        className="
                            text-sm font-medium text-ink-900 underline underline-offset-2
                            hover:text-vermilion-600 transition-colors whitespace-nowrap
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        {isLoggedIn ? 'Go to Heritage Vault' : 'Sign in'}
                    </Link>
                    <Link
                        href={ROUTES.apply}
                        className="
                            inline-flex items-center justify-center whitespace-nowrap
                            px-5 py-2 bg-vermilion-600 text-paper-50
                            text-sm font-medium rounded
                            hover:bg-vermilion-700 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        Open an account
                    </Link>
                </div>

                {/* Mobile menu toggle */}
                <div className="flex lg:hidden ml-auto">
                    <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open main menu"
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        className="
                            p-2.5 text-ink-700 hover:text-ink-900 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
            </nav>
        </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-50 bg-ink-900/50"
                        aria-hidden="true"
                        onClick={() => {
                            setMobileOpen(false);
                            menuButtonRef.current?.focus();
                        }}
                    />

                    {/* Drawer panel */}
                    <div
                        id="mobile-menu"
                        ref={mobileMenuRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Main navigation menu"
                        className="
                            fixed inset-y-0 right-0 z-50 w-80 max-w-full
                            bg-paper-50 border-l border-paper-200
                            px-6 py-6 overflow-y-auto flex flex-col
                        "
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-display font-semibold text-ink-900 text-h4">
                                {BRAND.shortName}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileOpen(false);
                                    menuButtonRef.current?.focus();
                                }}
                                aria-label="Close menu"
                                className="
                                    p-2 text-ink-700 hover:text-ink-900 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                "
                            >
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Primary nav */}
                        <nav aria-label="Mobile navigation">
                            <ul className="space-y-1 mb-8">
                                {NAV_ITEMS.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            aria-current={isActive(item.href) ? 'page' : undefined}
                                            className={`
                                                block px-4 py-3 text-body font-medium rounded transition-colors
                                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                                ${isActive(item.href)
                                                    ? 'bg-paper-100 text-ink-900'
                                                    : 'text-ink-700 hover:bg-paper-100 hover:text-ink-900'
                                                }
                                            `}
                                        >
                                            {item.name}
                                        </Link>
                                        {item.subItems && item.subItems.length > 0 && (
                                            <ul className="pl-6 mt-1 mb-3 space-y-1 border-l-2 border-paper-200 ml-4">
                                                {item.subItems.map((sub) => (
                                                    <li key={sub.name}>
                                                        <Link
                                                            href={sub.href}
                                                            onClick={() => handleSubItemClick(sub.href)}
                                                            className={`block px-4 py-2 text-sm rounded transition-colors ${
                                                                isSubItemActive(sub.href)
                                                                    ? 'bg-paper-200 text-ink-900 font-semibold'
                                                                    : 'text-ink-600 hover:text-ink-900 hover:bg-paper-100'
                                                            }`}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Utility links */}
                        <div className="border-t border-paper-200 pt-6 space-y-1 mb-6">
                            {[
                                { name: 'Locations', href: ROUTES.locations },
                                { name: 'Contact', href: ROUTES.contact },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="
                                        block px-4 py-2.5 text-small text-ink-700
                                        hover:text-ink-900 hover:bg-paper-100 rounded transition-colors
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                    "
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="mt-auto space-y-3 pt-4 border-t border-paper-200">
                            <Link
                                href={ROUTES.apply}
                                className="
                                    flex items-center justify-center w-full px-6 py-3
                                    bg-vermilion-600 text-paper-50 text-small font-medium rounded
                                    hover:bg-vermilion-700 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                "
                            >
                                Open an account
                            </Link>
                            <Link
                                href={isLoggedIn ? ROUTES.dashboard : ROUTES.login}
                                className="
                                    flex items-center justify-center w-full px-6 py-3
                                    border border-ink-900 text-ink-900 text-small font-medium rounded
                                    hover:bg-paper-100 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                "
                            >
                                {isLoggedIn ? 'Go to Heritage Vault' : 'Sign in to Heritage Vault'}
                            </Link>
                        </div>

                        <p className="mt-6 text-small text-ink-500 text-center">
                            {BRAND.fdic}
                        </p>
                    </div>
                </>
            )}
        </>
    );
}
