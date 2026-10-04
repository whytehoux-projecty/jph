import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, BarChart3, TrendingUp, Globe, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Portfolio Management | Wealth Management',
    description: `Institutional-caliber investment strategies with ${BRAND.legalName} Portfolio Management.`,
};

export default function PortfolioManagementPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/commercial.jpg" alt="Portfolio Management" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Portfolio Management</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Institutional-caliber investment strategies
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Our portfolio managers build customized, risk-adjusted portfolios tailored to your specific liquidity needs, time horizon, and long-term financial goals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Discuss your portfolio
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">A disciplined approach to investing</h2>
                        <p className="text-body-lg text-ink-700">Access to global markets and exclusive private investments.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Custom Portfolios */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <BarChart3 className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Discretionary Management</h3>
                                <p className="text-body text-ink-700 h-24">Delegate the day-to-day management of your investments to our experts, who navigate market volatility in alignment with your Investment Policy Statement.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Active and passive strategies</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Tax-loss harvesting capabilities</span></li>
                            </ul>
                        </div>

                        {/* Alternatives */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <TrendingUp className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Alternative Investments</h3>
                                <p className="text-body text-ink-700 h-24">Diversify beyond traditional stocks and bonds with access to exclusive private markets and specialized funds reserved for qualified purchasers.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Private equity and venture capital</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Hedge funds and real estate funds</span></li>
                            </ul>
                        </div>

                        {/* ESG */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Values-Based Investing</h3>
                                <p className="text-body text-ink-700 h-24">Align your portfolio with your personal values through Environmental, Social, and Governance (ESG) criteria and impact investing options.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Positive and negative screening</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Direct indexing for hyper-customization</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
