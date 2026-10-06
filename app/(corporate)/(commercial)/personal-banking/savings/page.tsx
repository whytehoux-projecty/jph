import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, Target, TrendingUp, ShieldCheck, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Savings & CDs | Personal Banking',
    description: `Explore ${BRAND.legalName} savings accounts and CDs. Reach your financial goals faster with competitive rates and automated saving tools.`,
};

export default function SavingsPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/savings.jpg" alt="Heritage Savings" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Savings & CDs</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Reach your savings goals
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Whether you're saving for a rainy day or a major purchase, we have the right account to help your money grow securely. Experience the power of automatic transfers and competitive rates.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                                Open a savings account
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SAVINGS ACCOUNTS */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Choose your savings path</h2>
                        <p className="text-body-lg text-ink-700">Flexible options with competitive rates to help you build your balance.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Advantage Savings */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Heritage Advantage Savings</h3>
                                <p className="text-body text-ink-700 h-12">Our most popular savings account, offering flexible access to your funds and simple ways to avoid the monthly fee.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$8.00</p>
                                <p className="text-small text-ink-500">Monthly maintenance fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Fee waived with a $500 minimum daily balance</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Earns interest on all balances</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Set up automatic transfers from checking</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Open Advantage Savings</Button>
                        </div>

                        {/* CDs */}
                        <div className="bg-paper-50 rounded-xl p-8 border-2 border-vermilion-600 flex flex-col shadow-md relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-vermilion-600 text-paper-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Higher Yields</div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Certificates of Deposit (CDs)</h3>
                                <p className="text-body text-ink-700 h-12">Lock in a guaranteed fixed interest rate for a specific term to maximize your returns safely.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">Fixed</p>
                                <p className="text-small text-ink-500">Guaranteed Return</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Terms ranging from 3 months to 5 years</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">$1,000 minimum opening deposit</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">FDIC insured up to maximum allowed limits</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Explore CD Rates</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
