import type { Metadata } from 'next';
import Link from 'next/link';
import {
    CheckCircle, Building2, Briefcase, TrendingUp,
    Globe, ArrowRight, Shield, Truck, HeartHandshake
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, RATES, PRODUCTS } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';
import { Figure } from '@/components/commercial-ui/Figure';
import { DisclosureBlock } from '@/components/commercial-ui/Footnote';

export const metadata: Metadata = {
    title: 'Business Banking',
    description: `${BRAND.legalName} business banking — commercial checking, merchant services, business loans, and treasury management for businesses of every size.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

const caseStudies = [
    {
        company: 'Vantage Tech Solutions',
        sector: 'Software/SaaS',
        result: 'Secured a $1.8M growth line of credit in 5 business days, enabling a critical infrastructure expansion that tripled ARR.',
        size: '45 Employees',
    },
    {
        company: 'Meridian Restaurant Group',
        sector: 'Hospitality',
        result: `Cut payment processing costs by 34% and eliminated week-long funding delays using ${BRAND.shortName} Merchant Services.`,
        size: '12 Locations',
    },
    {
        company: 'Crown Construction LLC',
        sector: 'Commercial Construction',
        result: `Streamlined draw management for a $22M commercial project through ${BRAND.shortName}'s integrated construction lending portal.`,
        size: '$40M Revenue',
    },
];

const industries = [
    { icon: Truck, name: 'Logistics & Distribution', description: 'Fleet financing, fuel card programs, and cash flow management for transportation businesses.' },
    { icon: Globe, name: 'Import/Export & Trade', description: 'Letters of credit, trade finance, and multi-currency accounts for international commerce.' },
    { icon: Building2, name: 'Real Estate & Construction', description: 'Construction draw loans, bridge financing, and property management banking solutions.' },
    { icon: Briefcase, name: 'Professional Services', description: 'IOLTA accounts, trust management, and specialized banking for law, healthcare, and accounting firms.' },
    { icon: TrendingUp, name: 'Technology & Growth', description: 'Venture debt and equity-linked credit facilities for growth-stage companies.' },
    { icon: HeartHandshake, name: 'Non-Profit Organizations', description: 'Zero-fee accounts and grant management tools for mission-driven organizations.' },
];

export default function BusinessBankingPage() {
    return (
        <main>
            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <p className="label-mono text-vermilion-600 mb-4">Business Banking</p>
                            <h1 className="font-display text-display-lg text-ink-900 leading-tight mb-6 text-balance">
                                A banking partner, not just a bank.
                            </h1>
                            <p className="text-body-lg text-ink-700 mb-8 max-w-lg">
                                From sole proprietors to mid-market enterprises, {BRAND.shortName} delivers commercial banking relationships built on decades of sector expertise — not spreadsheets and scorecards.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                                    Open a business account
                                </Button>
                                <Button as="a" href={ROUTES.contact} variant="secondary" size="lg">
                                    Speak with an advisor
                                </Button>
                            </div>
                        </div>
                        <div className="animate-fade-in-up animate-delay-200 relative aspect-[4/3] w-full rounded border border-paper-300 bg-paper-50 overflow-hidden shadow-sm">
                            <picture className="absolute inset-0">
                                <source srcSet="/images/new/business-hero.jpg" type="image/jpeg" />
                                <img
                                    src="/images/new/business-hero.jpg"
                                    alt="Professional team in a modern office environment"
                                    className="w-full h-full object-cover"
                                    fetchPriority="high"
                                />
                            </picture>
                            <div className="absolute inset-0 bg-ink-900/10 mix-blend-multiply" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CLIENT SUCCESS (Moved up) ─────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="label-mono text-vermilion-600 mb-3">Client Success</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Results that speak for themselves.</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {caseStudies.map((cs) => (
                            <div key={cs.company} className="bg-paper-100 p-8 rounded border border-paper-200 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="label-mono text-ink-700 bg-paper-200 px-2 py-1 rounded">{cs.sector}</span>
                                    <span className="text-small text-ink-500">{cs.size}</span>
                                </div>
                                <h3 className="font-display text-h4 text-ink-900 mb-3">{cs.company}</h3>
                                <p className="text-body text-ink-700 flex-grow">{cs.result}</p>
                                <div className="mt-6 pt-6 border-t border-paper-200">
                                    <Shield className="w-5 h-5 text-pine-700" aria-hidden="true" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRODUCTS ──────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-3xl space-y-24">
                    
                    {/* Checking */}
                    <div id="checking" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Business Checking</h2>
                        <p className="text-body-lg text-ink-700 mb-6">The foundation of your business finances.</p>
                        
                        <div className="flex gap-12 mb-8 p-6 bg-paper-100 border border-paper-200 rounded">
                            <Figure value="$0" label="Monthly fee for 12 months" footnoteRef={1} />
                            <Figure value="500" label="Free transactions / mo" />
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'Same-day ACH origination',
                                'Dedicated business debit cards for each authorized user',
                                'Positive Pay fraud protection included',
                                'QuickBooks® and Xero® direct integration',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.apply} variant="primary">
                            Open Business Checking
                        </Button>
                    </div>

                    <div className="hairline" />

                    {/* Merchant Services */}
                    <div id="merchant" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Merchant Services</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Accept every payment. Never miss a sale.</p>
                        
                        <div className="flex gap-12 mb-8 p-6 bg-paper-100 border border-paper-200 rounded">
                            <Figure value="0.15%" label="Plus $0.08 per transaction" />
                            <Figure value="24hr" label="Next-day funding" />
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'In-person, online, and mobile payment acceptance',
                                'Virtual terminal for phone and mail orders',
                                'Recurring billing and invoicing engine',
                                'Level 1 PCI-DSS compliance included',
                                'Dedicated merchant support line, 7 days a week',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.contact} variant="secondary">
                            Set Up Merchant Services
                        </Button>
                    </div>

                    <div className="hairline" />

                    {/* Business Lending */}
                    <div id="lending" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Business Loans & Lines</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Capital when and where you need it most.</p>
                        
                        <div className="flex gap-12 mb-8 p-6 bg-paper-100 border border-paper-200 rounded">
                            <Figure value="$5M" label="Maximum term loan" />
                            <Figure value="48h" label="Decision timeline" />
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'Term loans from $25,000 to $5,000,000',
                                'Business lines of credit: revolving, up to $2M',
                                'SBA 7(a) and 504 loan programs available',
                                'Equipment financing with up to 100% LTV',
                                'Commercial real estate mortgages at competitive rates',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.contact} variant="primary">
                            Explore Business Lending
                        </Button>
                    </div>
                    
                    <div className="hairline" />

                    {/* Payroll */}
                    <div id="payroll" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Payroll & HR Banking</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Pay your team on time, every time.</p>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'Integrated payroll processing for W-2 and 1099 workers',
                                'Same-day or next-day direct deposit',
                                'Tax filing and remittance — automated',
                                'Multi-state payroll support',
                                'Benefits and HSA account management',
                                'Compliance reporting and audit-ready record keeping',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.contact} variant="secondary">
                            Set Up Payroll Services
                        </Button>
                    </div>

                    <div className="hairline" />

                    {/* Treasury Management */}
                    <div id="treasury" className="scroll-mt-32">
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Treasury Management</h2>
                        <p className="text-body-lg text-ink-700 mb-6">Optimize cash flow and mitigate risk.</p>
                        
                        <ul className="space-y-3 mb-8">
                            {[
                                'Automated sweep accounts for idle cash',
                                'Advanced liquidity management and forecasting',
                                'Lockbox services for accelerated receivables',
                                'Information reporting and EDI',
                                'Custom API integration for ERP systems',
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                    <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0 mt-0.5" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button as="a" href={ROUTES.contact} variant="secondary">
                            Speak with a Treasury Advisor
                        </Button>
                    </div>

                </div>
            </section>

            {/* ── INDUSTRIES ────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="label-mono text-vermilion-600 mb-3">Sector Expertise</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">We know your industry.</h2>
                        <p className="text-body-lg text-ink-700">
                            Specialized banking relationships mean we understand your business — not just your balance.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {industries.map(({ icon: Icon, name, description }) => (
                            <Link
                                key={name}
                                href={ROUTES.contact}
                                className="group p-6 rounded border border-paper-200 bg-paper-50 hover:border-ink-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 block"
                            >
                                <div className="w-10 h-10 rounded bg-paper-200 flex items-center justify-center mb-4 group-hover:bg-ink-900 transition-colors">
                                    <Icon className="w-5 h-5 text-ink-900 group-hover:text-paper-50 transition-colors" aria-hidden="true" />
                                </div>
                                <h3 className="font-display text-h4 text-ink-900 mb-2 group-hover:text-vermilion-600 transition-colors">{name}</h3>
                                <p className="text-small text-ink-700 leading-relaxed">{description}</p>
                            </Link>
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
                                text: `Business Checking has $0 monthly maintenance fee for the first 12 statement cycles. After 12 months, a $15 monthly fee applies unless minimum balance requirements are met.`,
                            },
                        ]}
                    />
                </div>
            </section>
        </main>
    );
}
