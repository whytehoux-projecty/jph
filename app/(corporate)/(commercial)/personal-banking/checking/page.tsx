import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, ShieldCheck, Smartphone, Zap, Check
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: 'Checking Accounts | Personal Banking',
    description: `Explore ${BRAND.legalName} checking accounts. Find the right checking account for your everyday needs with mobile banking, zero overdraft fee options, and enhanced security.`,
};

export default function CheckingPage() {
    return (
        <main>
            {/* HERO */}
            <section className="relative bg-ink-900 text-paper-50 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/images/products/personal-hero.webp" alt="Heritage Checking" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/90 to-transparent" />
                </div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-2xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-500 mb-4">Personal Checking</p>
                        <h1 className="font-display text-display-lg leading-tight mb-6">
                            Heritage Advantage Checking
                        </h1>
                        <p className="text-body-lg text-paper-200 mb-8">
                            Three settings, one account. Choose the checking setting that works best for you and your family. Enjoy access to our award-winning Heritage Vault app, Fraud Shield™, and a vast network of ATMs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                                Open an account
                            </Button>
                            <Button as="a" href={ROUTES.locations} variant="secondary" size="lg" className="border-paper-50 text-paper-50 hover:bg-paper-50 hover:text-ink-900">
                                Find a branch
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMPARISON */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Find the checking setting for you</h2>
                        <p className="text-body-lg text-ink-700">As your life changes, your checking account can change with it. Switch settings anytime in Heritage Vault.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* SafeBalance */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">SafeBalance</h3>
                                <p className="text-body text-ink-700 h-12">Help stay within your balance and avoid overdraft fees.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$4.95</p>
                                <p className="text-small text-ink-500">Monthly maintenance fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Fee waived for students under 25</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">No overdraft fees</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Paperless account with digital statements</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="secondary" className="w-full justify-center">Open SafeBalance</Button>
                        </div>

                        {/* Plus */}
                        <div className="bg-paper-50 rounded-xl p-8 border-2 border-vermilion-600 flex flex-col shadow-md relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-vermilion-600 text-paper-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Advantage Plus</h3>
                                <p className="text-body text-ink-700 h-12">For your everyday banking needs with easy ways to waive the fee.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$12.00</p>
                                <p className="text-small text-ink-500">Monthly maintenance fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Fee waived with one $250+ direct deposit</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Write checks and get paper statements</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Access to Zelle® for easy payments</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary" className="w-full justify-center">Open Plus</Button>
                        </div>

                        {/* Relationship */}
                        <div className="bg-paper-100 rounded-xl p-8 border border-paper-200 flex flex-col shadow-sm">
                            <div className="mb-6">
                                <h3 className="font-display text-h3 text-ink-900 mb-2">Relationship</h3>
                                <p className="text-body text-ink-700 h-12">Earn interest and get fee waivers on extra services.</p>
                            </div>
                            <div className="mb-8">
                                <p className="text-display-sm text-ink-900 font-medium">$25.00</p>
                                <p className="text-small text-ink-500">Monthly maintenance fee</p>
                            </div>
                            <ul className="space-y-4 mb-8 grow">
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Fee waived with $10,000 combined balances</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">Earns interest on checking balance</span></li>
                                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-vermilion-600 shrink-0" /><span className="text-small text-ink-700">No fees on domestic wire transfers</span></li>
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="secondary" className="w-full justify-center">Open Relationship</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-24 bg-paper-100">
                <div className="container mx-auto px-6 max-w-7xl">
                    <h2 className="font-display text-h2 text-ink-900 mb-12 text-center">Included with every setting</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-paper-200 rounded-full flex items-center justify-center mb-6">
                                <Smartphone className="w-8 h-8 text-ink-900" />
                            </div>
                            <h3 className="font-display text-h4 text-ink-900 mb-3">Heritage Vault App</h3>
                            <p className="text-body text-ink-700">Deposit checks, manage alerts, and lock your debit card instantly from anywhere.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-paper-200 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-8 h-8 text-ink-900" />
                            </div>
                            <h3 className="font-display text-h4 text-ink-900 mb-3">$0 Liability Guarantee</h3>
                            <p className="text-body text-ink-700">You are not responsible for unauthorized transactions made with your debit card.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-paper-200 rounded-full flex items-center justify-center mb-6">
                                <Zap className="w-8 h-8 text-ink-900" />
                            </div>
                            <h3 className="font-display text-h4 text-ink-900 mb-3">Early Direct Deposit</h3>
                            <p className="text-body text-ink-700">Get your paycheck up to two days early when you set up direct deposit.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
