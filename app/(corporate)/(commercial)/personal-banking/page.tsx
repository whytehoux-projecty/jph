import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    CheckCircle, ShieldCheck, Smartphone, Clock,
    TrendingUp, Zap, ArrowRight,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, RATES, PRODUCTS } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';
import { Figure } from '@/components/commercial-ui/Figure';
import { DisclosureBlock } from '@/components/commercial-ui/Footnote';

export const metadata: Metadata = {
    title: 'Personal Banking',
    description: `${BRAND.legalName} personal banking — checking, savings, credit cards, and personal loans designed to help you build lasting financial security.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

const benefits = [
    { icon: Smartphone, title: 'Heritage Vault Digital Banking', description: 'Full-featured mobile and web access. Deposit checks, pay bills, send wires, manage cards — 24/7.' },
    { icon: ShieldCheck, title: 'Fraud Shield™ Protection', description: 'AI-driven real-time fraud monitoring with instant alerts and zero liability on unauthorized transactions.' },
    { icon: Clock, title: 'Extended Branch Hours', description: 'Branches open Monday–Saturday with Sunday hours at select locations. Phone support 24/7/365.' },
    { icon: TrendingUp, title: 'Financial Wellness Tools', description: 'Built-in budgeting, goal tracking, and spending insights inside Heritage Vault to keep you on track.' },
    { icon: Zap, title: 'Instant Account Opening', description: 'Open any personal account online in under 5 minutes. No paperwork. No branch visit required.' },
    { icon: CheckCircle, title: 'Relationship Rewards', description: 'The more you bank with us, the more you save. Rate discounts and fee waivers for multi-product clients.' },
];

export default function PersonalBankingPage() {
    return (
        <main>
            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <p className="label-mono text-vermilion-600 mb-4">Personal Banking</p>
                            <h1 className="font-display text-display-lg text-ink-900 leading-tight mb-6 text-balance">
                                Your financial life, simplified.
                            </h1>
                            <p className="text-body-lg text-ink-700 mb-8 max-w-lg">
                                From your first savings account to your family&apos;s mortgage, {BRAND.shortName} offers products built around your life — not our bottom line. Recognized for exceptional client service in 2025.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                                    Open an account
                                </Button>
                                <Button as="a" href={ROUTES.login} variant="secondary" size="lg">
                                    Sign in to Heritage Vault
                                </Button>
                            </div>
                        </div>
                        <div className="animate-fade-in-up animate-delay-200 relative aspect-[4/3] w-full rounded border border-paper-300 bg-paper-50 overflow-hidden shadow-sm">
                            {/* Vault App Screenshot Mock */}
                            <div className="absolute inset-x-8 -bottom-12 top-8 rounded-t-xl bg-ink-900 border-[6px] border-ink-900 overflow-hidden shadow-2xl flex flex-col">
                                <div className="h-6 bg-ink-900 w-full flex items-center justify-center shrink-0">
                                    <div className="w-16 h-1.5 rounded-full bg-ink-700" />
                                </div>
                                <div className="flex-grow bg-paper-100 p-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="w-8 h-8 rounded-full bg-vermilion-600" />
                                        <div className="w-24 h-4 rounded bg-paper-200" />
                                    </div>
                                    <div className="h-24 rounded bg-paper-50 border border-paper-200 mb-4 p-4 flex flex-col justify-end">
                                        <div className="w-32 h-6 rounded bg-paper-200" />
                                    </div>
                                    <div className="h-24 rounded bg-paper-50 border border-paper-200 p-4 flex flex-col justify-end">
                                        <div className="w-24 h-6 rounded bg-paper-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── COMPARISON ROW ────────────────────────────────────────── */}
            <section className="bg-paper-50 border-b border-paper-200 py-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="label-mono text-ink-500 mb-1">Checking APY</p>
                            <p className="font-mono text-data text-ink-900 font-medium">{RATES.checkingApy}</p>
                        </div>
                        <div>
                            <p className="label-mono text-ink-500 mb-1">Savings APY</p>
                            <p className="font-mono text-data text-vermilion-600 font-medium">{RATES.savingsApy}<sup className="text-[0.6em] ml-0.5">1</sup></p>
                        </div>
                        <div>
                            <p className="label-mono text-ink-500 mb-1">Monthly fee</p>
                            <p className="font-mono text-data text-ink-900 font-medium">$0</p>
                        </div>
                        <div>
                            <p className="label-mono text-ink-500 mb-1">Minimum deposit</p>
                            <p className="font-mono text-data text-ink-900 font-medium">$0</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRODUCTS ──────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50">
                <div className="container mx-auto px-6 max-w-3xl space-y-24">
                    
                    {/* Checking */}
                    <div id="checking" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Heritage Checking</h2>
                        <p className="text-body-lg text-ink-700 mb-6">For everyday spending and life on the move.</p>
                        
                        <div className="flex gap-12 mb-8 p-6 bg-paper-100 border border-paper-200 rounded">
                            <Figure value={RATES.checkingApy} label="Annual Percentage Yield" />
                            <Figure value="$0" label="Monthly maintenance fee" />
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'No monthly maintenance fees — ever',
                                'Unlimited domestic ATM fee refunds',
                                'Real-time transaction alerts',
                                'Early direct deposit (up to 2 days early)',
                                'FDIC insured up to $250,000',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.apply} variant="primary">
                            Open Checking Account
                        </Button>
                    </div>

                    <div className="hairline" />

                    {/* Savings */}
                    <div id="savings" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Heritage Savings</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Grow your money faster with elite rates.</p>
                        
                        <div className="flex gap-12 mb-8 p-6 bg-paper-100 border border-paper-200 rounded">
                            <Figure value={RATES.savingsApy} label="Annual Percentage Yield" footnoteRef={1} />
                            <Figure value="$0" label="Minimum balance" />
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                `${RATES.savingsApy} APY — among the highest nationally`,
                                'No minimum balance requirement',
                                'Unlimited deposits, up to 6 withdrawals/month',
                                'Compound interest calculated daily',
                                'FDIC insured up to $250,000',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.apply} variant="primary">
                            Open Savings Account
                        </Button>
                    </div>

                    <div className="hairline" />

                    {/* Credit Card */}
                    <div id="card" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Heritage Rewards Visa®</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Earn on every purchase you already make.</p>
                        
                        <div className="flex flex-wrap gap-12 mb-8 p-6 bg-paper-100 border border-paper-200 rounded">
                            <Figure value={RATES.cardCashback} label="Unlimited cash back" />
                            <Figure value="$0" label="Annual fee" />
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                `${RATES.cardCashback} unlimited cash back on all purchases`,
                                `${RATES.cardIntroApr} on purchases & transfers`,
                                'No foreign transaction fees',
                                'Travel accident insurance & purchase protection',
                                'EMV chip + virtual card for Heritage Vault',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <p className="text-small text-ink-500 mb-6">{RATES.cardRegularApr} applies after introductory period.</p>
                        <Button as="a" href={ROUTES.apply} variant="primary">
                            Apply for Credit Card
                        </Button>
                    </div>

                    <div className="hairline" />

                    {/* Personal Loan */}
                    <div id="loan" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Personal Loan</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Flexible financing for life&apos;s important moments.</p>
                        
                        <div className="flex gap-12 mb-8 p-6 bg-paper-100 border border-paper-200 rounded">
                            <Figure value={RATES.personalLoanFrom} label="Starting rate" footnoteRef={2} />
                            <Figure value="$100k" label="Maximum loan amount" />
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'Borrow $2,500 – $100,000',
                                'Terms from 12 to 84 months',
                                'No prepayment penalty',
                                'Same-business-day funding for approved applications',
                                'Relationship rate discount for Heritage Vault clients',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.apply} variant="primary">
                            Apply for Personal Loan
                        </Button>
                    </div>
                    
                    <div className="hairline" />

                    {/* Mortgages */}
                    <div id="mortgages" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Mortgages</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Expert guidance to bring you home.</p>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'Fixed-rate and adjustable-rate mortgages (ARMs)',
                                'Jumbo loans for higher-value properties',
                                'First-time homebuyer programs with low down payments',
                                'Dedicated mortgage advisors to guide you from application to closing',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.contact} variant="secondary">
                            Speak with a Mortgage Advisor
                        </Button>
                    </div>

                </div>
            </section>

            {/* ── BENEFITS ──────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-t border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="label-mono text-vermilion-600 mb-3">The {BRAND.shortName} Difference</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">More than a bank account.</h2>
                        <p className="text-body-lg text-ink-700">
                            Every relationship comes with tools and services designed to help you genuinely prosper.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="p-6 rounded border border-paper-200 bg-paper-50">
                                <div className="w-10 h-10 rounded bg-paper-200 flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5 text-ink-900" aria-hidden="true" />
                                </div>
                                <h3 className="font-display text-h4 text-ink-900 mb-2">{title}</h3>
                                <p className="text-small text-ink-700 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DISCLOSURES ───────────────────────────────────────────── */}
            <section className="bg-paper-50 py-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <DisclosureBlock
                        items={[
                            {
                                ref: 1,
                                text: `Annual Percentage Yield (APY) is accurate as of ${RATES.asOf}. Rates are variable and subject to change at any time without notice after the account is opened. Fees may reduce earnings.`,
                            },
                            {
                                ref: 2,
                                text: 'Personal loan rates and terms are subject to credit approval. The lowest rates are available to highly qualified borrowers and include a relationship discount for automatic payments from a Heritage Trust account.',
                            },
                        ]}
                    />
                </div>
            </section>
        </main>
    );
}
