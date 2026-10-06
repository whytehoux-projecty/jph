import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, BookOpen, Heart, Building, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Estate Planning | Wealth Management',
    description: `Shape your legacy with ${BRAND.legalName} Estate Planning Services. Ensure a smooth transition of wealth to your heirs.`,
};

export default function EstatePlanningPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/corporate-hero.jpg" alt="Estate Planning" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Estate Planning</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Shape your legacy
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            We collaborate with your legal and tax professionals to structure an estate plan that minimizes tax implications and ensures a smooth transition of wealth to your heirs and chosen charities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Start planning
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Comprehensive Estate Solutions</h2>
                        <p className="text-body-lg text-ink-700">Protecting your assets for the people and causes you care about most.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Estate Settlement */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <BookOpen className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Estate Settlement</h3>
                                <p className="text-body text-ink-700 h-24">Alleviate the burden on your loved ones by appointing Heritage Trust as executor to handle the complex administration of your estate.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Impartial dispute resolution</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Tax filing and debt settlement</span></li>
                            </ul>
                        </div>

                        {/* Philanthropy */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <Heart className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Philanthropic Giving</h3>
                                <p className="text-body text-ink-700 h-24">Structure your charitable giving efficiently through Donor-Advised Funds (DAFs) or private foundations to maximize your impact.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Charitable Remainder Trusts (CRTs)</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Strategic grantmaking advice</span></li>
                            </ul>
                        </div>

                        {/* Succession */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <Building className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Business Succession</h3>
                                <p className="text-body text-ink-700 h-24">Ensure your business continues to thrive after your retirement or passing by planning the transition of ownership and leadership.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Buy-sell agreement funding</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Key person insurance strategies</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
