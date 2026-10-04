import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, Home, Car, User, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Loans & Mortgages | Personal Banking',
    description: `Finance your goals with ${BRAND.legalName}. We offer competitive rates on home loans, auto loans, and personal loans tailored to your needs.`,
};

export default function PersonalLoansPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/home-loan.jpg" alt="Heritage Loans" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Loans & Mortgages</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Finance your next big step
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Whether you're buying a new home, upgrading your vehicle, or consolidating debt, we offer competitive rates and personalized lending solutions to help you achieve your goals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Connect with a lender
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* LOAN OPTIONS */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Borrowing solutions designed for you</h2>
                        <p className="text-body-lg text-ink-700">Explore our flexible financing options to find the perfect fit.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Home Loans */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-vermilion-100 flex items-center justify-center mb-6">
                                <Home className="w-6 h-6 text-vermilion-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Home Loans & Mortgages</h3>
                                <p className="text-body text-ink-700 h-24">Buy your dream home, refinance for a lower rate, or tap into your home's equity with a HELOC.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Fixed and adjustable-rate options</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">FHA, VA, and Jumbo loans available</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Flexible Home Equity Lines of Credit</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.contact} variant="primary" className="w-full justify-center">Explore Mortgages</Button>
                        </div>

                        {/* Auto Loans */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-pine-100 flex items-center justify-center mb-6">
                                <Car className="w-6 h-6 text-pine-600" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Auto Loans</h3>
                                <p className="text-body text-ink-700 h-24">Drive away with confidence. We offer fast approvals and great rates for new cars, used cars, and refinancing.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Rates as low as 5.49% APR</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Finance vehicles up to 10 years old</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Get preapproved before you shop</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Apply for Auto Loan</Button>
                        </div>

                        {/* Personal Loans */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-ink-200 flex items-center justify-center mb-6">
                                <User className="w-6 h-6 text-ink-900" />
                            </div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Personal Loans</h3>
                                <p className="text-body text-ink-700 h-24">Consolidate high-interest debt, pay for unexpected expenses, or fund a major life event with a fixed-rate personal loan.</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Borrow from $2,000 to $50,000</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">No origination fees or prepayment penalties</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Funds available as soon as next business day</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Apply for Personal Loan</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
