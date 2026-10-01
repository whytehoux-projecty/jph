'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ROUTES, BANK_INFO } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';

const NAV_ITEMS = [
    { name: 'Personal', href: ROUTES.personalBanking },
    { name: 'Business', href: ROUTES.businessBanking },
    { name: 'Wealth', href: '/wealth' },
    { name: 'About', href: ROUTES.about },
];

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
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

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
                scrolled ? 'bg-paper-50/95 border-paper-200' : 'bg-paper-50 border-paper-200'
            } backdrop-blur-md`}
        >
            <nav
                aria-label="Main navigation"
                className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
            >
                {/* Wordmark */}
                <div className="flex flex-1">
                    <Link
                        href={ROUTES.home}
                        aria-label={`${BRAND.shortName} — Home`}
                        className="
                            font-display font-semibold text-ink-900 text-h4
                            tracking-tight hover:text-vermilion-600 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        {BRAND.shortName}
                    </Link>
                </div>

                {/* Desktop primary nav */}
                <div className="hidden lg:flex lg:gap-x-8" role="list">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            role="listitem"
                            aria-current={isActive(item.href) ? 'page' : undefined}
                            className={`
                                text-small font-medium transition-colors py-1
                                border-b-2 border-transparent hover:border-vermilion-600
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                ${isActive(item.href)
                                    ? 'text-ink-900 border-b-2 border-ink-900'
                                    : 'text-ink-700 hover:text-ink-900'
                                }
                            `}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop utility row */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4 lg:items-center">
                    <Link
                        href={ROUTES.locations}
                        className="
                            text-small text-ink-700 hover:text-ink-900 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        Locations
                    </Link>
                    <Link
                        href={ROUTES.contact}
                        className="
                            text-small text-ink-700 hover:text-ink-900 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        Contact
                    </Link>
                    <Link
                        href={ROUTES.login}
                        className="
                            text-small font-medium text-ink-900 underline underline-offset-2
                            hover:text-vermilion-600 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        Sign in
                    </Link>
                    <Link
                        href={ROUTES.apply}
                        className="
                            inline-flex items-center justify-center
                            px-5 py-2.5 bg-vermilion-600 text-paper-50
                            text-small font-medium rounded
                            hover:bg-vermilion-700 transition-colors
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                        "
                    >
                        Open an account
                    </Link>
                </div>

                {/* Mobile menu toggle */}
                <div className="flex lg:hidden">
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
                                href={ROUTES.login}
                                className="
                                    flex items-center justify-center w-full px-6 py-3
                                    border border-ink-900 text-ink-900 text-small font-medium rounded
                                    hover:bg-paper-100 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                "
                            >
                                Sign in to Heritage Vault
                            </Link>
                        </div>

                        <p className="mt-6 text-small text-ink-500 text-center">
                            {BRAND.fdic}
                        </p>
                    </div>
                </>
            )}
        </header>
    );
}
