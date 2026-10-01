import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    ShieldCheck, Globe, Headphones, Smartphone,
    ArrowRight, Lock
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, FACTS, RATES, yearsOfService, ACQUISITIONS } from '@/src/content/facts';
import { Figure } from '@/components/commercial-ui/Figure';

export const metadata: Metadata = {
    title: 'Heritage Trust Bank — Trusted Since 1888',
    description:
        `Heritage Trust Bank has served families, businesses, and institutions since ${BRAND.founded}. ` +
        `Member FDIC. Heritage Savings earns ${RATES.savingsApy} APY. Open an account today.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: 'Heritage Trust Bank' }],
    },
    twitter: { card: 'summary_large_image' },
};

// ─── Proof stats (all from facts.ts) ──────────────────────────────────────────
const proofStats = [
    { value: `${yearsOfService()}`, label: 'Years of Service' },
    { value: FACTS.assets, label: 'Assets' },
    { value: FACTS.clients, label: 'Clients' },
    { value: FACTS.atms, label: 'Surcharge-free ATMs' },
];

// ─── Segment cards ─────────────────────────────────────────────────────────────
const segments = [
    {
        id: 'personal',
        label: 'Personal Banking',
        heading: 'Banking that fits your life',
        body: 'Heritage Checking, Heritage Savings, mortgage lending, and the Heritage Rewards Visa® — built around how you actually live.',
        cta: 'See personal accounts',
        href: ROUTES.personalBanking,
        stat: RATES.savingsApy,
        statLabel: 'APY — Heritage Savings',
    },
    {
        id: 'business',
        label: 'Business Banking',
        heading: 'A banking partner, not just a bank',
        body: 'Dedicated relationship managers, business checking, merchant services, and commercial lending — for sole proprietors to mid-market enterprises.',
        cta: 'See business solutions',
        href: ROUTES.businessBanking,
        stat: RATES.businessCheckingApy,
        statLabel: 'APY — Business Checking',
    },
    {
        id: 'wealth',
        label: 'Wealth Management',
        heading: 'Advice for what matters most',
        body: 'Private banking, investment management, estate planning, and multi-generational wealth strategy — through a single, dedicated advisor relationship.',
        cta: 'Explore wealth management',
        href: '/wealth',
        stat: `$${FACTS.assets}`,
        statLabel: 'Assets under management',
    },
];

// ─── Security pillars ──────────────────────────────────────────────────────────
const securityPillars = [
    {
        icon: ShieldCheck,
        title: 'FDIC Insured to $250,000',
        body: 'Every deposit account is federally insured by the FDIC, individually, up to $250,000.',
        href: ROUTES.security,
    },
    {
        icon: Lock,
        title: '256-bit AES Encryption',
        body: 'All data in transit and at rest is protected by AES-256 — the same standard used by the US Department of Defense.',
        href: ROUTES.security,
    },
    {
        icon: Globe,
        title: '24/7 Fraud Intelligence',
        body: 'Real-time AI monitoring flags anomalous transactions the moment they occur — with zero-liability protection.',
        href: ROUTES.security,
    },
];

// ─── B2B Outcome cards ─────────────────────────────────────────────────────────
const outcomes = [
    {
        client: 'Regional Construction Firm',
        result: 'Consolidated 4 banking relationships into one. Streamlined draw management for a $22M commercial project and cut payment processing time by 60%.',
        href: ROUTES.businessBanking,
    },
    {
        client: 'Independent Retail Chain',
        result: 'Cut payment processing costs by 34% and eliminated week-long funding delays using Heritage Trust merchant services and integrated treasury tools.',
        href: ROUTES.businessBanking,
    },
];

export default function Home() {
    return (
        <main>
            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section
                aria-labelledby="hero-heading"
                className="relative min-h-[88vh] flex items-center overflow-hidden bg-paper-50"
            >
                {/* Hero image — converts to AVIF/WebP manually (next.config unoptimized:true) */}
                <picture className="absolute inset-0 -z-10">
                    <source srcSet="/images/new/banking-hero.jpg" type="image/jpeg" />
                    <img
                        src="/images/new/banking-hero.jpg"
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                        fetchPriority="high"
                    />
                </picture>
                {/* Overlay: paper-50 tint that reveals the image subtly */}
                <div className="absolute inset-0 bg-ink-900/70 -z-10" />

                <div className="container mx-auto px-6 max-w-7xl py-24">
                    <div className="max-w-2xl">
                        {/* Eyebrow */}
                        <p className="label-mono text-paper-200 mb-6 animate-fade-in">
                            Est. {BRAND.founded} · Member FDIC
                        </p>

                        {/* Headline */}
                        <h1
                            id="hero-heading"
                            className="font-display text-display-xl text-paper-50 text-balance mb-6 animate-fade-in-up"
                        >
                            Banking built on{' '}
                            <span className="text-vermilion-400">138 years</span>{' '}
                            of trust.
                        </h1>

                        {/* Subhead with APY — the one "wow" number in the hero */}
                        <p className="text-body-lg text-paper-200 mb-4 animate-fade-in-up animate-delay-100">
                            Heritage Savings earns{' '}
                            <span className="font-mono text-paper-50 font-medium">{RATES.savingsApy} APY</span>
                            {' '}— with no minimums and no monthly fee.
                        </p>
                        <p className="text-small text-paper-300 mb-10 animate-fade-in-up animate-delay-100">
                            APY as of {RATES.asOf}. Variable rate. Conditions apply.
                        </p>

                        {/* Single primary CTA + text link */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up animate-delay-200">
                            <Link
                                href={ROUTES.apply}
                                className="
                                    inline-flex items-center justify-center gap-2
                                    px-8 py-4 bg-vermilion-600 text-paper-50
                                    font-sans font-medium text-body rounded
                                    hover:bg-vermilion-700 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-50
                                "
                            >
                                Open an account
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                            <Link
                                href={ROUTES.login}
                                className="
                                    inline-flex items-center py-4 px-2
                                    text-paper-200 font-medium underline underline-offset-2
                                    hover:text-paper-50 transition-colors
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-50
                                "
                            >
                                Sign in to Heritage Vault
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PROOF STRIP ───────────────────────────────────────────── */}
            <section
                aria-label="Heritage Trust by the numbers"
                className="bg-paper-100 border-b border-paper-200 py-12"
            >
                <div className="container mx-auto px-6 max-w-7xl">
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {proofStats.map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <dd>
                                    <Figure value={value} label={label} size="large" />
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ── SEGMENTS ──────────────────────────────────────────────── */}
            <section aria-labelledby="segments-heading" className="py-24 bg-paper-50">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-2xl mb-16">
                        <p className="label-mono text-vermilion-600 mb-3">Our services</p>
                        <h2
                            id="segments-heading"
                            className="font-display text-h1 text-ink-900 text-balance"
                        >
                            Financial solutions at every stage.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {segments.map((seg) => (
                            <article
                                key={seg.id}
                                className="
                                    flex flex-col p-8 bg-paper-100
                                    border border-paper-200 rounded
                                    hover:border-ink-900 transition-colors group
                                "
                            >
                                <p className="label-mono text-vermilion-600 mb-4">{seg.label}</p>
                                <h3 className="font-display text-h3 text-ink-900 mb-3 text-balance">
                                    {seg.heading}
                                </h3>
                                <p className="text-body text-ink-700 mb-6 flex-grow">{seg.body}</p>

                                {/* Key stat */}
                                <div className="border-t border-paper-200 pt-4 mb-6">
                                    <Figure value={seg.stat} label={seg.statLabel} />
                                </div>

                                <Link
                                    href={seg.href}
                                    className="
                                        inline-flex items-center gap-2 text-small font-medium text-ink-900
                                        underline underline-offset-2 hover:text-vermilion-600 transition-colors
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                    "
                                    aria-label={seg.cta}
                                >
                                    {seg.cta}
                                    <ArrowRight
                                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUTCOMES ──────────────────────────────────────────────── */}
            <section aria-labelledby="outcomes-heading" className="py-24 bg-paper-100 border-t border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-2xl mb-16">
                        <p className="label-mono text-vermilion-600 mb-3">Client outcomes</p>
                        <h2
                            id="outcomes-heading"
                            className="font-display text-h1 text-ink-900 text-balance"
                        >
                            Results, not promises.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {outcomes.map((o) => (
                            <article
                                key={o.client}
                                className="p-8 bg-paper-50 border border-paper-200 rounded"
                            >
                                <p className="label-mono text-ink-500 mb-4">{o.client}</p>
                                <p className="text-body-lg text-ink-900">{o.result}</p>
                                <Link
                                    href={o.href}
                                    className="
                                        inline-flex items-center gap-2 mt-6 text-small font-medium text-ink-900
                                        underline underline-offset-2 hover:text-vermilion-600 transition-colors
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                    "
                                >
                                    See business solutions
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HERITAGE VAULT BAND ───────────────────────────────────── */}
            <section
                aria-labelledby="vault-heading"
                className="theme-ink py-24"
                style={{ background: 'var(--bg)' }}
            >
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <div
                        className="
                            inline-flex items-center justify-center w-14 h-14
                            rounded border mb-8
                        "
                        style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
                    >
                        <Lock className="w-7 h-7" style={{ color: 'var(--action)' }} aria-hidden="true" />
                    </div>

                    <h2
                        id="vault-heading"
                        className="font-display text-h1 text-balance mb-6"
                        style={{ color: 'var(--text)' }}
                    >
                        {BRAND.vault} — your bank, in your pocket.
                    </h2>

                    <p className="text-body-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Check balances, transfer funds, pay bills, and manage cards — from one
                        secure, award-winning digital platform.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={ROUTES.login}
                            className="
                                inline-flex items-center justify-center gap-2
                                px-8 py-4 rounded font-sans font-medium text-body transition-colors
                                focus-visible:outline-2 focus-visible:outline-offset-2
                            "
                            style={{
                                background: 'var(--action)',
                                color: '#FBF9F4',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--action-hover)')}
                            onMouseOut={(e) => (e.currentTarget.style.background = 'var(--action)')}
                        >
                            <Smartphone className="w-5 h-5" aria-hidden="true" />
                            Sign in to Heritage Vault
                        </Link>
                        <Link
                            href={ROUTES.enroll}
                            className="
                                inline-flex items-center justify-center gap-2
                                px-8 py-4 rounded font-sans font-medium text-body transition-colors
                                border focus-visible:outline-2 focus-visible:outline-offset-2
                            "
                            style={{
                                borderColor: 'var(--line)',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Get online access
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── SECURITY ──────────────────────────────────────────────── */}
            <section aria-labelledby="security-heading" className="py-24 bg-paper-50 border-t border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-2xl mb-16">
                        <p className="label-mono text-pine-700 mb-3">Security</p>
                        <h2
                            id="security-heading"
                            className="font-display text-h1 text-ink-900 text-balance"
                        >
                            Bank with confidence.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {securityPillars.map(({ icon: Icon, title, body, href }) => (
                            <div key={title} className="p-6 border border-paper-200 rounded bg-paper-100">
                                <div
                                    className="inline-flex items-center justify-center w-10 h-10 rounded mb-4"
                                    style={{ background: '#E6F3EC' }}
                                >
                                    <Icon className="w-5 h-5 text-pine-700" aria-hidden="true" />
                                </div>
                                <h3 className="font-display text-h4 text-ink-900 mb-2">{title}</h3>
                                <p className="text-small text-ink-700 mb-4">{body}</p>
                                <Link
                                    href={href}
                                    className="
                                        text-small font-medium text-ink-900 underline underline-offset-2
                                        hover:text-vermilion-600 transition-colors
                                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
                                    "
                                >
                                    Learn more about security →
                                </Link>
                            </div>
                        ))}
                    </div>

                    <p className="mt-8 text-small text-ink-500 text-center">
                        {BRAND.fdic}
                    </p>
                </div>
            </section>
        </main>
    );
}
