'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { ROUTES, BANK_INFO } from '@/lib/constants';

const navigation = [
    { name: 'Personal Banking', href: ROUTES.personalBanking },
    { name: 'Business Banking', href: ROUTES.businessBanking },
    { name: 'Wealth Management', href: '/wealth' },
    { name: 'About', href: ROUTES.about },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-[#091C38] shadow-vintage-lg'
                : 'bg-[#0D2545]'
        } backdrop-blur-md border-b border-white/10`}>
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" aria-label="Main navigation">

                {/* Logo */}
                <div className="flex lg:flex-1">
                    <Link href={ROUTES.home} aria-label="JP Heritage Bank — Home">
                        <div className="relative h-12 w-48">
                            <Image
                                src="/bank-logo.svg"
                                alt="JP Heritage Bank"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden lg:flex lg:gap-x-8">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-white/80 hover:text-white hover:text-[#D4AF7A] transition-colors duration-200 py-1 border-b border-transparent hover:border-[#B8960C]/50"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-3 lg:items-center">
                    <Link
                        href={ROUTES.apply}
                        className="text-sm font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-none transition-all duration-200"
                    >
                        Open Account
                    </Link>
                    <Link
                        href={ROUTES.vault}
                        className="inline-flex items-center gap-2 text-sm font-semibold bg-[#B8960C] hover:bg-[#D4AF7A] text-white px-5 py-2 rounded-none transition-all duration-200 shadow-gold-glow hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <Shield className="w-4 h-4" />
                        Access Vault
                    </Link>
                </div>

                {/* Mobile menu button */}
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="p-2.5 text-white/80 hover:text-white"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open main menu"
                    >
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-[#0D2545] px-6 py-6 shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-none bg-[#B8960C] flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-bold font-playfair">JP Heritage Bank</span>
                            </div>
                            <button
                                type="button"
                                className="p-2 text-white/70 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-1 mb-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-none transition-colors font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <div className="space-y-3 border-t border-white/10 pt-6">
                            <Link
                                href={ROUTES.apply}
                                className="block w-full text-center py-3 border border-white/30 text-white font-semibold rounded-none hover:bg-white/10 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Open Account
                            </Link>
                            <Link
                                href={ROUTES.vault}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#B8960C] text-white font-semibold rounded-none hover:bg-[#D4AF7A] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Shield className="w-4 h-4" />
                                Access Vault
                            </Link>
                        </div>

                        <p className="mt-8 text-xs text-white/40 text-center">{BANK_INFO.fdic}</p>
                    </div>
                </>
            )}
        </header>
    );
}
