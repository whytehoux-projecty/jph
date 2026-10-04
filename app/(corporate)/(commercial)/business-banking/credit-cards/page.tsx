import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, CreditCard, DollarSign, Briefcase, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Business Credit Cards | Business Banking',
    description: `Fuel your business growth with ${BRAND.legalName} Business Rewards credit cards. Enjoy cash back, flexible spending, and robust management tools.`,
};

export default function BusinessCreditCardsPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/business-card.jpg" alt="Business Credit Cards" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Business Credit Cards</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Fuel your growth with purchasing power
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Heritage Trust Business Rewards cards offer unlimited cash back on the categories where your business spends most, plus valuable travel and expense management tools.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                                Compare business cards
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CARD CATEGORIES */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Cards designed for your business</h2>
                        <p className="text-body-lg text-ink-700">Get the purchasing power you need with the rewards you want.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Cash Rewards */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <DollarSign className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Business Advantage Cash Rewards</h3>
                                <p className="text-body text-ink-700 h-16">Earn cash back on your heaviest spending categories like office supplies, gas, or software.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$0</p>
                                <p className="text-small text-ink-500">Annual Fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">3% cash back in the category of your choice</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">2% cash back on dining</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">1% cash back on all other purchases</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Apply Now</Button>
                        </div>

                        {/* Unlimited Rewards */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <CreditCard className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Business Advantage Unlimited</h3>
                                <p className="text-body text-ink-700 h-16">Keep it simple with a flat, unlimited cash back rate on every purchase you make.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$0</p>
                                <p className="text-small text-ink-500">Annual Fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">1.5% cash back on all purchases, everywhere</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">No categories to track or limits to worry about</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Free employee cards with spending controls</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Apply Now</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
