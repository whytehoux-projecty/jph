import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, CreditCard, Plane, DollarSign, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Credit Cards | Personal Banking',
    description: `Find the right credit card for you with ${BRAND.legalName}. Choose from cash back, travel rewards, or low interest rate cards.`,
};

export default function CreditCardsPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/rewards-card.jpg" alt="Heritage Credit Cards" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Credit Cards</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Find the credit card that's right for you
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Whether you want to earn cash back on everyday purchases, travel the world, or build your credit, we have a card designed to reward your lifestyle.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                                Compare all cards
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CARD CATEGORIES */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Explore our featured cards</h2>
                        <p className="text-body-lg text-ink-700">Unlock more value on every purchase with zero fraud liability.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Cash Back */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <DollarSign className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Customized Cash Rewards</h3>
                                <p className="text-body text-ink-700 h-16">Maximize your cash back in the category of your choice, like gas, dining, or online shopping.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$0</p>
                                <p className="text-small text-ink-500">Annual Fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">3% cash back in your category of choice</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">2% cash back at grocery stores</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">1% cash back on all other purchases</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Apply Now</Button>
                        </div>

                        {/* Travel Rewards */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <Plane className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Travel Rewards</h3>
                                <p className="text-body text-ink-700 h-16">Earn unlimited points to redeem for flights, hotels, or statement credits with no blackout dates.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$0</p>
                                <p className="text-small text-ink-500">Annual Fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">1.5 points for every $1 spent on all purchases</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">No foreign transaction fees</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">25,000 online bonus points offer</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Apply Now</Button>
                        </div>

                        {/* Premium Rewards */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <CreditCard className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Premium Rewards</h3>
                                <p className="text-body text-ink-700 h-16">Elevate your experience with premium travel benefits and accelerated earnings.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$95</p>
                                <p className="text-small text-ink-500">Annual Fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">2 points on travel and dining purchases</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">$100 airline incidental statement credit</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">TSA PreCheck®/Global Entry statement credit</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Apply Now</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
