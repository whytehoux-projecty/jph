import type { Metadata } from 'next';
import Image from 'next/image';
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
                        <div className="animate-fade-in-up animate-delay-200 relative aspect-4/3 w-full rounded border border-paper-300 bg-paper-50 overflow-hidden shadow-sm">
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
                                <p className="text-body text-ink-700 grow">{cs.result}</p>
                                <div className="mt-6 pt-6 border-t border-paper-200">
                                    <Shield className="w-5 h-5 text-pine-700" aria-hidden="true" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRODUCTS ──────────────────────────────────────────────── */}
            {/* ── PRODUCTS ──────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl space-y-32">
                    
                    {/* Checking */}
                    <div id="checking" className="scroll-mt-32 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-h2 text-ink-900 mb-4">Small Business Checking</h2>
                            <p className="text-body-lg text-ink-700 mb-6">The foundation of your business finances. Experience the convenience of Heritage Trust Business Advantage Checking. From robust cash flow tools to easy QuickBooks® integration, we provide the resources you need to manage your day-to-day operations seamlessly.</p>
                            
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Same-day ACH origination and wire transfers',
                                    'Dedicated business debit cards with customizable employee limits',
                                    'Advanced fraud protection with Positive Pay',
                                    'Access to Cash Flow Monitor in Heritage Vault for Business',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                        <CheckCircle className="w-5 h-5 text-vermilion-600 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary">
                                Open business checking
                            </Button>
                        </div>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-paper-200">
                            <Image src="/images/products/business-checking.jpg" alt="Business Checking" fill className="object-cover" />
                        </div>
                    </div>

                    {/* Savings & CDs */}
                    <div id="savings" className="scroll-mt-32 grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-last md:order-first relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-paper-200">
                            <Image src="/images/products/business-savings.jpg" alt="Business Savings" fill className="object-cover" />
                        </div>
                        <div>
                            <h2 className="font-display text-h2 text-ink-900 mb-4">Business Savings & CDs</h2>
                            <p className="text-body-lg text-ink-700 mb-6">Put your excess cash to work. Whether you're building a reserve for seasonal expenses or saving for a major expansion, our high-yield Business Savings and Certificate of Deposit (CD) accounts provide the growth and security you need.</p>
                            
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Competitive interest rates to maximize your returns',
                                    'Flexible terms for Business CDs from 3 months to 5 years',
                                    'Automatic transfers to simplify saving',
                                    'FDIC insured up to the maximum allowable limits',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                        <CheckCircle className="w-5 h-5 text-vermilion-600 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary">
                                Open a savings account
                            </Button>
                        </div>
                    </div>

                    {/* Business Credit Cards */}
                    <div id="cards" className="scroll-mt-32 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-h2 text-ink-900 mb-4">Business Credit Cards</h2>
                            <p className="text-body-lg text-ink-700 mb-6">Fuel your growth with purchasing power. Heritage Trust Business Rewards cards offer unlimited cash back on the categories where your business spends most, plus valuable travel and expense management tools.</p>
                            
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Unlimited cash back on all business purchases',
                                    'No annual fee options available',
                                    'Free employee cards with customized spending limits',
                                    'Integration with major expense management software',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                        <CheckCircle className="w-5 h-5 text-vermilion-600 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button as="a" href={ROUTES.apply} variant="primary">
                                Explore business credit cards
                            </Button>
                        </div>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-paper-200">
                            <Image src="/images/products/business-card.jpg" alt="Business Credit Cards" fill className="object-cover" />
                        </div>
                    </div>

                    {/* Business Lending */}
                    <div id="lending" className="scroll-mt-32 grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-last md:order-first relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-paper-200">
                            <Image src="/images/products/business-loans.jpg" alt="Business Loans" fill className="object-cover" />
                        </div>
                        <div>
                            <h2 className="font-display text-h2 text-ink-900 mb-4">Loans & Financing</h2>
                            <p className="text-body-lg text-ink-700 mb-6">Capital when and where you need it most. From SBA loans to commercial real estate mortgages and equipment financing, our dedicated business lenders will help structure the right credit facility to scale your operations.</p>
                            
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Revolving business lines of credit up to $2M',
                                    'SBA 7(a) and 504 loan programs available',
                                    'Equipment financing with up to 100% LTV',
                                    'Streamlined application and fast decision timelines',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                        <CheckCircle className="w-5 h-5 text-vermilion-600 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button as="a" href={ROUTES.contact} variant="secondary">
                                Speak with a lending specialist
                            </Button>
                        </div>
                    </div>
                    
                    {/* Merchant Services */}
                    <div id="merchant" className="scroll-mt-32 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-h2 text-ink-900 mb-4">Merchant Services</h2>
                            <p className="text-body-lg text-ink-700 mb-6">Accept every payment. Never miss a sale. Heritage Trust Merchant Services provides comprehensive point-of-sale and online gateway solutions with next-day funding to keep your cash flowing smoothly.</p>
                            
                            <ul className="space-y-3 mb-8">
                                {[
                                    'In-person, online, and mobile payment acceptance',
                                    'Next-day funding for approved transactions',
                                    'Transparent pricing with no hidden fees',
                                    'Level 1 PCI-DSS compliance and robust fraud protection',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-body text-ink-700">
                                        <CheckCircle className="w-5 h-5 text-vermilion-600 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button as="a" href={ROUTES.contact} variant="secondary">
                                Set up merchant services
                            </Button>
                        </div>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-paper-200">
                            <Image src="/images/products/merchant.jpg" alt="Merchant Services" fill className="object-cover" />
                        </div>
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
