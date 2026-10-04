import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, PieChart, TrendingUp, BarChart3, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Capital Markets | Corporations & Institutions',
    description: `Debt and equity underwriting, syndications, and sales and trading services with ${BRAND.legalName} Capital Markets.`,
};

export default function CapitalMarketsPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/corporate-hero.jpg" alt="Capital Markets" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Capital Markets</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Executing complex capital solutions
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            We provide deep market insights, extensive distribution capabilities, and flawless execution for debt and equity underwriting, syndications, and sales and trading.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Connect with the syndicate desk
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Market-leading execution</h2>
                        <p className="text-body-lg text-ink-700">Connecting issuers with investors across the globe.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <TrendingUp className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Debt Capital Markets</h3>
                                <p className="text-body text-ink-700 h-24">Origination, structuring, and execution of investment-grade and high-yield bond offerings.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Corporate bonds and commercial paper</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Securitized products</span></li>
                            </ul>
                        </div>

                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <PieChart className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Equity Capital Markets</h3>
                                <p className="text-body text-ink-700 h-24">Comprehensive advisory and execution for IPOs, follow-on offerings, and convertible debt.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Initial Public Offerings (IPOs)</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Private placements</span></li>
                            </ul>
                        </div>

                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <BarChart3 className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Sales & Trading</h3>
                                <p className="text-body text-ink-700 h-24">Liquidity provision, market making, and execution services across all major asset classes.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Equities and fixed income</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Foreign exchange and commodities</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
