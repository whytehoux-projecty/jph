import type { Metadata } from 'next';
import Link from 'next/link';
import {
    TrendingUp, Shield, Users, Briefcase,
    CheckCircle, BarChart3, Globe,
    Lock
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, FACTS, yearsOfService } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';
import { Figure } from '@/components/commercial-ui/Figure';
import { DisclosureBlock } from '@/components/commercial-ui/Footnote';

export const metadata: Metadata = {
    title: 'Wealth Management',
    description: `${BRAND.legalName} Wealth Management — personalized investment advisory, trust services, estate planning, and portfolio management for high-net-worth individuals and families.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

const services = [
    {
        icon: BarChart3,
        name: 'Investment Advisory',
        description: `Tailored portfolio construction across equities, fixed income, alternatives, and private markets. Guided by our Investment Policy Committee with $${FACTS.assets} under advisement.`,
        features: ['Risk-adjusted portfolio optimization', 'Direct indexing & tax-loss harvesting', 'ESG-aligned investment strategies', 'Alternative investments & private credit access'],
    },
    {
        icon: Shield,
        name: 'Trust & Estate Services',
        description: `${BRAND.shortName} serves as corporate trustee, executor, and administrator for estates of all complexities. Our trust officers have an average tenure of 18 years.`,
        features: ['Revocable and irrevocable trust administration', 'Estate settlement and probate guidance', 'Charitable giving vehicles (DAF, CRT, CLT)', 'Family Limited Partnership structuring'],
    },
    {
        icon: Users,
        name: 'Family Office Services',
        description: 'Comprehensive family office capabilities for ultra-high-net-worth families — from consolidated reporting to next-generation financial education.',
        features: ['Consolidated multi-custodian reporting', 'Family governance and succession planning', 'Bill payment and household management', 'Philanthropic advisory and foundation management'],
    },
    {
        icon: Globe,
        name: 'International Wealth',
        description: 'Cross-border wealth structuring for internationally mobile clients, expatriates, and families with assets in multiple jurisdictions.',
        features: ['Multi-currency account management', 'Offshore trust and structure advisory', 'FATCA/CRS compliance guidance', 'International wire and FX services'],
    },
];

const minimums = [
    { tier: 'Heritage Select', minimum: '$250,000', features: ['Dedicated wealth advisor', 'Quarterly portfolio review', 'Preferred banking rates', 'Priority client service line'] },
    { tier: 'Heritage Private', minimum: '$1,000,000', features: ['Lead advisor + investment team', 'Monthly performance reporting', 'Estate planning consultation', 'Family wealth platform access'] },
    { tier: 'Heritage Ultra', minimum: '$10,000,000', features: ['Dedicated family office team', 'Custom investment mandates', 'Concierge banking & lifestyle', 'Next-gen financial education'] },
];

export default function WealthManagementPage() {
    return (
        <main>
            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-3xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-600 mb-4">Wealth Management</p>
                        <h1 className="font-display text-display-lg text-ink-900 leading-tight mb-6 text-balance">
                            Your legacy deserves more than a portfolio.
                        </h1>
                        <p className="text-body-lg text-ink-700 leading-relaxed mb-10">
                            {BRAND.shortName} Wealth Management delivers institutional-grade investment advisory, trust services, and family wealth planning — with the personal relationship of a trusted private bank. We don&apos;t just manage your assets. We protect what you&apos;ve built and help it endure.
                        </p>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <Button as="a" href={ROUTES.contact} variant="primary" size="lg">
                                Schedule a private consultation
                            </Button>
                            <Link
                                href={`tel:${BRAND.phoneTel}`}
                                className="
                                    inline-flex items-center py-4 px-2
                                    text-ink-900 font-medium underline underline-offset-2
                                    hover:text-vermilion-600 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                "
                            >
                                Call {BRAND.phoneDisplay}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SERVICES ──────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="label-mono text-vermilion-600 mb-3">Our Services</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Comprehensive wealth solutions.</h2>
                        <p className="text-body-lg text-ink-700">
                            From investment management to multi-generational estate planning, {BRAND.shortName} provides the full spectrum of private banking and wealth services — under one relationship.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map(({ icon: Icon, name, description, features }) => (
                            <div key={name} className="bg-paper-100 rounded p-8 border border-paper-200">
                                <div className="w-10 h-10 rounded bg-paper-200 flex items-center justify-center mb-5">
                                    <Icon className="w-5 h-5 text-ink-900" aria-hidden="true" />
                                </div>
                                <h3 className="font-display text-h4 text-ink-900 mb-3">{name}</h3>
                                <p className="text-body text-ink-700 leading-relaxed mb-6">{description}</p>
                                <ul className="space-y-3">
                                    {features.map((f) => (
                                        <li key={f} className="flex items-start gap-3 text-body text-ink-700">
                                            <CheckCircle className="w-5 h-5 text-pine-700 shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SERVICE TIERS ─────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="label-mono text-vermilion-600 mb-3">Service Tiers</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">A relationship scaled to your wealth.</h2>
                        <p className="text-body-lg text-ink-700">
                            Every {BRAND.shortName} wealth client receives a dedicated advisor. The depth of service scales with your relationship.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {minimums.map((tier, i) => {
                            // Differentiate visually by weight/size per the brief, not colour
                            const isMiddle = i === 1;
                            const isHighest = i === 2;
                            return (
                                <div
                                    key={tier.tier}
                                    className={`
                                        rounded p-8 border bg-paper-100 flex flex-col
                                        ${isHighest ? 'border-ink-900 shadow-sm' : 'border-paper-200'}
                                    `}
                                >
                                    <div className="mb-6">
                                        <p className="label-mono text-ink-500 mb-2">{tier.tier}</p>
                                        <p className={`font-mono text-ink-900 ${isHighest ? 'text-4xl font-medium' : isMiddle ? 'text-3xl' : 'text-2xl'}`}>
                                            {tier.minimum}
                                        </p>
                                        <p className="text-small text-ink-500 mt-1">Minimum investable assets</p>
                                    </div>
                                    <ul className="space-y-3 grow mb-8">
                                        {tier.features.map((f) => (
                                            <li key={f} className="flex items-start gap-3 text-body text-ink-700">
                                                <CheckCircle className="w-5 h-5 text-pine-700 shrink-0 mt-0.5" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── TRUST & SECURITY ──────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="w-12 h-12 rounded bg-paper-200 flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-6 h-6 text-ink-900" aria-hidden="true" />
                            </div>
                            <Figure value={`$${FACTS.assets}`} label="Assets Under Advisement" />
                        </div>
                        <div>
                            <div className="w-12 h-12 rounded bg-paper-200 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-6 h-6 text-ink-900" aria-hidden="true" />
                            </div>
                            <Figure value={yearsOfService().toString()} label="Years Managing Wealth" />
                        </div>
                        <div>
                            <div className="w-12 h-12 rounded bg-paper-200 flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-6 h-6 text-ink-900" aria-hidden="true" />
                            </div>
                            <Figure value="98%" label="Client Retention Rate" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DISCLOSURES ───────────────────────────────────────────── */}
            <section className="bg-paper-50 py-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <DisclosureBlock
                        items={[
                            { ref: 1, text: "Investment products are not FDIC insured, not bank guaranteed, and may lose value." }
                        ]}
                    />
                </div>
            </section>
        </main>
    );
}
