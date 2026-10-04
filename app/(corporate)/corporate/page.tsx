import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, Globe2, Building2, BarChart4, PieChart
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Corporations & Institutions',
    description: `Global banking and market solutions for mid-sized companies, large corporations, and institutional investors with ${BRAND.legalName}.`,
};

export default function CorporateInstitutionsPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/corporate-hero.jpg" alt="Corporate Banking" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Corporations & Institutions</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Global reach. Local expertise.
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Heritage Trust delivers comprehensive financial solutions, strategic advisory, and capital markets expertise to help your organization navigate complexity and drive growth across the globe.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Contact a coverage banker
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Solutions for every stage of growth</h2>
                        <p className="text-body-lg text-ink-700">From commercial lending to global treasury and capital markets.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Commercial Banking */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm hover:border-ink-900 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <Building2 className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Commercial Banking</h3>
                                <p className="text-body text-ink-700">Strategic financing and treasury solutions for mid-sized companies with revenues from $50M to $2B.</p>
                            </div>
                            <Button as="a" href="/corporate/commercial" variant="secondary" className="w-fit mt-auto">Explore Commercial Banking</Button>
                        </div>

                        {/* Global Corporate */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm hover:border-ink-900 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <Globe2 className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Global Corporate Banking</h3>
                                <p className="text-body text-ink-700">Cross-border capital raising, risk management, and advisory services for large multinational corporations.</p>
                            </div>
                            <Button as="a" href="/corporate/global" variant="secondary" className="w-fit mt-auto">Explore Global Corporate</Button>
                        </div>

                        {/* Treasury Services */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm hover:border-ink-900 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <BarChart4 className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Treasury & Trade Solutions</h3>
                                <p className="text-body text-ink-700">Optimize liquidity, streamline global payments, and mitigate supply chain risk with our advanced digital platforms.</p>
                            </div>
                            <Button as="a" href="/corporate/treasury" variant="secondary" className="w-fit mt-auto">Explore Treasury Services</Button>
                        </div>

                        {/* Capital Markets */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm hover:border-ink-900 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <PieChart className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Capital Markets</h3>
                                <p className="text-body text-ink-700">Debt and equity underwriting, syndications, and sales and trading services for institutional investors and issuers.</p>
                            </div>
                            <Button as="a" href="/corporate/capital" variant="secondary" className="w-fit mt-auto">Explore Capital Markets</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
