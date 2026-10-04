import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, Briefcase, Zap, Building2, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Business Checking Accounts | Business Banking',
    description: `Manage your day-to-day operations seamlessly with ${BRAND.legalName} Business Checking. Solutions designed for small to medium businesses.`,
};

export default function BusinessCheckingPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/business-checking.jpg" alt="Business Checking" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Business Checking</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            The foundation of your business finances
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Experience the convenience of Heritage Trust Business Advantage Checking. From robust cash flow tools to easy QuickBooks® integration, we provide the resources you need.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                                Open an account
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMPARISON */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Find the right checking for your business</h2>
                        <p className="text-body-lg text-ink-700">Accounts designed to scale as your business grows.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Fundamentals */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Business Fundamentals</h3>
                                <p className="text-body text-ink-700 h-12">Ideal for small or newly established businesses with lighter transaction volumes.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$16.00</p>
                                <p className="text-small text-ink-500">Monthly maintenance fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Fee waived with $5,000 average monthly balance</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">200 fee-free transactions per month</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Up to $7,500 in cash deposits per month without a fee</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="secondary" className="w-full justify-center">Open Fundamentals</Button>
                        </div>

                        {/* Advantage */}
                        <div className="bg-paper-50 rounded-xl p-8 border-2 border-vermilion-600 flex flex-col shadow-md relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-vermilion-600 text-paper-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Business Advantage</h3>
                                <p className="text-body text-ink-700 h-12">Designed for growing businesses with higher transaction and cash deposit needs.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$29.95</p>
                                <p className="text-small text-ink-500">Monthly maintenance fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Fee waived with $15,000 average monthly balance</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">500 fee-free transactions per month</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Up to $20,000 in cash deposits per month without a fee</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Open Advantage</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
