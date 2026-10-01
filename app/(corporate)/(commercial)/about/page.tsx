import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Shield, Award, Users, TrendingUp, MapPin,
    ArrowRight, CheckCircle, Globe, Lock, Landmark
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, FACTS, yearsOfService } from '@/src/content/facts';
import { Button } from '@/components/commercial-ui/Button';

export const metadata: Metadata = {
    title: `About ${BRAND.legalName}`,
    description: `Learn about ${BRAND.legalName} — ${yearsOfService()} years of trusted banking, our leadership team, our mission, and our commitment to every client we serve.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

const timeline = [
    {
        year: '1888',
        title: 'The Heritage Begins',
        description: 'Jonathan P. Heritage II founds a trust and savings institution in lower Manhattan, serving the emerging merchant class of New York City.',
    },
    {
        year: '1929',
        title: 'Strength Through Crisis',
        description: 'We remained solvent and fully operational through the Great Depression, honoring every depositor. Trust earned in adversity defines us to this day.',
    },
    {
        year: '1968',
        title: 'National Expansion',
        description: 'Received a national charter and began expansion across the United States, extending our trusted relationship model coast to coast.',
    },
    {
        year: '2007',
        title: 'Digital Investment',
        description: 'A major structural investment in our digital banking platform. Our early focus on digital infrastructure would prove transformative for the decade ahead.',
    },
    {
        year: '2019',
        title: 'Heritage Vault Launch',
        description: 'Heritage Vault — our award-winning digital banking platform — launches, bringing institutional-quality banking tools to every client.',
    },
    {
        year: new Date().getFullYear().toString(),
        title: 'The Next Chapter',
        description: `With $${FACTS.assets} in assets and ${FACTS.clients} clients, ${BRAND.shortName} continues to grow — guided by the same principles instilled in 1888.`,
    },
];

const leadership = [
    {
        name: 'Catherine J. Whitmore',
        title: 'President & Chief Executive Officer',
        bio: `Catherine has led ${BRAND.shortName} since 2018, driving a 40% growth in assets under management and the successful launch of Heritage Vault. Previously CFO of First Atlantic Bancorp.`,
        tenure: 'CEO since 2018',
    },
    {
        name: 'Marcus T. Okonkwo',
        title: 'Chief Financial Officer',
        bio: `Marcus oversees all financial operations, treasury, and investor relations for ${BRAND.shortName}. With 22 years in institutional finance, he led the bank through two significant acquisitions.`,
        tenure: 'CFO since 2020',
    },
    {
        name: 'Dr. Priya Sharma',
        title: 'Chief Technology & Digital Officer',
        bio: `Priya architects ${BRAND.shortName}'s technology strategy, including Heritage Vault and the bank's AI-driven fraud prevention infrastructure. Named to the Top 50 Women in Tech Leadership, 2024.`,
        tenure: 'CTDO since 2019',
    },
    {
        name: 'Robert A. Fernandez',
        title: 'Chief Risk Officer',
        bio: `Robert maintains ${BRAND.shortName}'s industry-leading risk posture. With 28 years in banking regulation and risk management — including a decade at the Federal Reserve — he ensures we protect every client's assets with institutional rigor.`,
        tenure: 'CRO since 2017',
    },
];

const securityPillars = [
    {
        icon: Lock,
        title: '256-bit AES Encryption',
        description: 'All data in transit and at rest is protected by AES-256 — the same encryption standard used by the US Department of Defense.',
    },
    {
        icon: Shield,
        title: `FDIC Insured to $250,000`,
        description: `Every deposit account is federally insured, individually, up to $250,000 — with options to extend coverage further.`,
    },
    {
        icon: Globe,
        title: '24/7 Fraud Intelligence',
        description: 'Our AI fraud monitoring processes 4 million transaction signals daily, flagging anomalies in real time with zero-liability protection for clients.',
    },
    {
        icon: Users,
        title: 'Zero Trust Architecture',
        description: 'Heritage Vault operates on a Zero Trust security model — every session is authenticated and authorized, every time, with no implicit trust granted.',
    },
];

const recognitions = [
    { award: '#1 Client Satisfaction — Regional', body: 'National Financial Index', year: '2025' },
    { award: 'Best Digital Banking Platform', body: 'The Banking Review', year: '2025' },
    { award: 'Best Place to Work — Finance', body: 'National Business Journal', year: '2024' },
];

export default function AboutPage() {
    return (
        <main>
            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="relative py-24 bg-paper-100 border-b border-paper-200 overflow-hidden">
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-3xl animate-fade-in-up">
                        <p className="label-mono text-vermilion-600 mb-4">About {BRAND.shortName}</p>
                        <h1 className="font-display text-display-lg text-ink-900 leading-tight mb-6">
                            {yearsOfService()} years of doing what&apos;s right.
                        </h1>
                        <p className="text-body-lg text-ink-700 leading-relaxed mb-8">
                            We were founded in 1888 on a single belief: that banking should make people&apos;s lives better, not more complicated. Four generations of clients and {yearsOfService()} years later, that belief still guides every decision we make.
                        </p>
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-paper-200">
                            <div>
                                <p className="font-mono text-3xl text-vermilion-600 font-medium">${FACTS.assets}</p>
                                <p className="text-small text-ink-500 mt-1">Assets Under Management</p>
                            </div>
                            <div>
                                <p className="font-mono text-3xl text-vermilion-600 font-medium">{FACTS.clients}</p>
                                <p className="text-small text-ink-500 mt-1">Clients Nationwide</p>
                            </div>
                            <div>
                                <p className="font-mono text-3xl text-vermilion-600 font-medium">{FACTS.atms}</p>
                                <p className="text-small text-ink-500 mt-1">Surcharge-Free ATMs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MISSION ───────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="label-mono text-vermilion-600 mb-4">Our Mission</p>
                            <h2 className="font-display text-h2 text-ink-900 mb-6">We exist to help people prosper.</h2>
                            <p className="text-body text-ink-700 leading-relaxed mb-6">
                                Every product we design, every policy we write, and every hire we make is evaluated against one question: does this help our clients build better financial lives? If the answer isn&apos;t yes, we don&apos;t do it.
                            </p>
                            <div className="space-y-4 mt-8">
                                {[
                                    'Transparent pricing — no surprise fees',
                                    'Community reinvestment that exceeds requirements',
                                    'Carbon-neutral operations since 2022',
                                    'Pay equity certified by third-party auditors'
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-body text-ink-700">
                                        <CheckCircle className="w-5 h-5 text-pine-700 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative aspect-square w-full rounded border border-paper-300 bg-paper-100 overflow-hidden shadow-sm">
                            <picture className="absolute inset-0">
                                <source srcSet="/images/new/bank-building.jpg" type="image/jpeg" />
                                <img
                                    src="/images/new/bank-building.jpg"
                                    alt="Historic stone facade of the original bank building"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </picture>
                            <div className="absolute inset-0 bg-ink-900/10 mix-blend-multiply" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TIMELINE ──────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <p className="label-mono text-vermilion-600 mb-3">Our History</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">{yearsOfService()} Years of Heritage</h2>
                    </div>
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[39px] top-0 bottom-0 w-px bg-paper-300 hidden md:block" />
                        
                        <div className="space-y-12">
                            {timeline.map((item) => (
                                <div key={item.year} className="relative flex gap-8 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-20 h-20 bg-paper-50 rounded border border-paper-200 flex flex-col items-center justify-center">
                                        <Landmark className="w-5 h-5 text-vermilion-600 mb-1" aria-hidden="true" />
                                        <span className="font-mono text-small text-ink-900 font-medium">{item.year}</span>
                                    </div>
                                    <div className="bg-paper-50 rounded p-6 flex-1 border border-paper-200">
                                        <h3 className="font-display text-h4 text-ink-900 mb-2">{item.title}</h3>
                                        <p className="text-body text-ink-700 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LEADERSHIP ────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200" id="leadership">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="label-mono text-vermilion-600 mb-3">Leadership</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Executive Leadership Team</h2>
                        <p className="text-body-lg text-ink-700">
                            Our leadership team brings together more than 120 combined years of banking, technology, and regulatory experience.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {leadership.map((leader) => {
                            // Extract initials for the monogram tile
                            const initials = leader.name.split(' ').map(n => n[0]).join('').substring(0, 2);
                            return (
                                <div key={leader.name} className="flex flex-col sm:flex-row gap-6 p-8 rounded border border-paper-200 bg-paper-100">
                                    {/* Monogram tile */}
                                    <div className="w-20 h-20 rounded bg-ink-900 flex-shrink-0 flex items-center justify-center text-paper-50">
                                        <span className="font-display text-2xl">{initials}</span>
                                    </div>
                                    <div>
                                        <span className="label-mono text-vermilion-600 mb-2 block">{leader.tenure}</span>
                                        <h3 className="font-display text-h4 text-ink-900 mb-1">{leader.name}</h3>
                                        <p className="text-small text-ink-500 mb-4">{leader.title}</p>
                                        <p className="text-body text-ink-700 leading-relaxed">{leader.bio}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── SECURITY ──────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="label-mono text-vermilion-600 mb-3">Security & Compliance</p>
                        <h2 className="font-display text-h2 text-ink-900 mb-4">Your security is our highest priority.</h2>
                        <p className="text-body-lg text-ink-700">
                            {BRAND.shortName} invests more per client in security infrastructure than any other bank of our size. Your money and data are protected by multiple independent layers of defense.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {securityPillars.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="p-6 rounded bg-paper-50 border border-paper-200">
                                <Icon className="w-6 h-6 text-pine-700 mb-4" aria-hidden="true" />
                                <h3 className="font-display text-h4 text-ink-900 mb-2">{title}</h3>
                                <p className="text-small text-ink-700 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── RECOGNITIONS ──────────────────────────────────────────── */}
            <section className="py-24 bg-paper-50 border-b border-paper-200">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-12">
                        <p className="label-mono text-vermilion-600 mb-3">Recognition</p>
                        <h2 className="font-display text-h2 text-ink-900">Industry Recognition</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {recognitions.map((rec) => (
                            <div key={rec.award} className="p-6 bg-paper-100 rounded border border-paper-200 flex items-start gap-4">
                                <Award className="w-6 h-6 text-vermilion-600 flex-shrink-0" aria-hidden="true" />
                                <div>
                                    <p className="font-medium text-ink-900 text-body mb-1">{rec.award}</p>
                                    <p className="text-small text-ink-500">{rec.body} · {rec.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────── */}
            <section className="py-24 bg-paper-100">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                    <h2 className="font-display text-h2 text-ink-900 mb-4">Become part of the heritage.</h2>
                    <p className="text-body-lg text-ink-700 mb-8">
                        Join {FACTS.clients} clients who trust {BRAND.shortName} with their financial futures. Open your account in minutes — or speak with a banker today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button as="a" href={ROUTES.apply} variant="primary" size="lg">
                            Open an account
                        </Button>
                        <Button as="a" href={ROUTES.contact} variant="secondary" size="lg">
                            Contact Us
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
