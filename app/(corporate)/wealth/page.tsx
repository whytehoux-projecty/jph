import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, FACTS, WEALTH_TIERS, yearsOfService } from '@/src/content/facts';
import {
    PageHero,
    SectionHeading,
    FactList,
    DoorwayGrid,
    BankerCard,
    CtaBand,
} from '@/components/commercial-ui/Isobath';
import { DisclosureBlock } from '@/components/commercial-ui/Footnote';

export const metadata: Metadata = {
    title: 'Wealth management',
    description: `${BRAND.shortName} wealth management — investment advice, trust services, estate planning and portfolio management through one adviser.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

const tiers = [
    {
        tier: WEALTH_TIERS.select,
        features: ['Dedicated wealth adviser', 'Quarterly portfolio review', 'Preferred banking rates', 'Priority client service line'],
    },
    {
        tier: WEALTH_TIERS.private,
        features: ['Lead adviser and investment team', 'Monthly performance reporting', 'Estate planning consultation', 'Family wealth platform access'],
    },
    {
        tier: WEALTH_TIERS.ultra,
        features: ['Dedicated family office team', 'Custom investment mandates', 'Family governance and succession', 'Next-generation financial education'],
    },
];

export default function WealthManagementPage() {
    const consult = `${ROUTES.contact}?topic=wealth`;
    return (
        <>
            <PageHero
                label="Wealth management"
                title={
                    <>
                        Your legacy deserves <span className="ht-em">more than a portfolio.</span>
                    </>
                }
                lead={`Investment advice, trust services and family wealth planning from ${BRAND.shortName} — through one adviser who knows the whole picture, and the specialists behind them.`}
                primary={{ href: consult, label: 'Book a private consultation' }}
                secondary={{ href: '#tiers', label: 'Compare service tiers' }}
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: '/wealth', label: 'Wealth management' },
                ]}
                aside={
                    <FactList
                        items={[
                            { term: 'Relationships from', value: WEALTH_TIERS.select.minimum },
                            { term: 'Assets under management', value: FACTS.aum },
                            { term: 'Managing wealth since', value: `${BRAND.founded}` },
                            { term: 'Your adviser', value: 'Named from the first call' },
                        ]}
                        caption={`Assets under management as of ${FACTS.asOf}; a separate measure from the bank’s total assets.`}
                    />
                }
            />

            {/* Services */}
            <section aria-labelledby="wealth-services-heading" className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="wealth-services-heading"
                        label="Services"
                        title="One relationship, four disciplines"
                        intro="Your adviser brings in each specialist when you need them, and keeps one record of your plans."
                    />
                    <DoorwayGrid
                        doors={[
                            {
                                number: '01',
                                label: 'Advice',
                                title: 'Private wealth',
                                body: 'A private wealth adviser for planning, lending and banking needs that cross the lines between them.',
                                href: '/wealth/private',
                                linkLabel: 'Private wealth',
                            },
                            {
                                number: '02',
                                label: 'Fiduciary',
                                title: 'Trust services',
                                body: 'We act as corporate trustee, administering trust assets impartially for the generations that follow.',
                                href: '/wealth/trust',
                                linkLabel: 'Trust services',
                            },
                            {
                                number: '03',
                                label: 'Planning',
                                title: 'Estate planning',
                                body: 'We work with your attorney and tax adviser to structure what you pass on, and to whom.',
                                href: '/wealth/estate',
                                linkLabel: 'Estate planning',
                            },
                            {
                                number: '04',
                                label: 'Investment',
                                title: 'Portfolio management',
                                body: 'Discretionary and advisory portfolios built around your liquidity needs, horizon and goals.',
                                href: '/wealth/portfolio',
                                linkLabel: 'Portfolio management',
                            },
                        ]}
                    />
                </div>
            </section>

            {/* Tiers */}
            <section id="tiers" aria-labelledby="tiers-heading" className="scroll-mt-24 border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="tiers-heading"
                        label="Service tiers"
                        title="A relationship scaled to your wealth"
                        intro="Every wealth client has a dedicated adviser. The depth of the team grows with the relationship."
                    />
                    <ol className="grid gap-px border-y border-paper-200 bg-paper-200 md:grid-cols-3">
                        {tiers.map(({ tier, features }) => (
                            <li key={tier.name} className="flex flex-col bg-paper-50 p-6 lg:p-8">
                                <h3 className="text-h3 text-ink-900">{tier.name}</h3>
                                <p className="mt-4 text-figure font-light text-ink-900 tabular">{tier.minimum}</p>
                                <p className="text-small text-ink-500">Minimum investable assets</p>
                                <p className="mt-4 text-small text-ink-700">{tier.description}</p>
                                <ul className="mt-6 grow space-y-2 border-t border-paper-200 pt-4">
                                    {features.map((f) => (
                                        <li key={f} className="flex gap-3 text-small text-ink-700">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden="true" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Figures — AUM kept separate from total assets */}
            <section aria-labelledby="wealth-figures-heading" className="border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="wealth-figures-heading"
                        label="By the numbers"
                        title="Two different measures, never added together"
                        link={{ href: '/transparency#strength', label: 'Sources on the transparency page' }}
                    />
                    <dl className="grid border-t border-ink-900 md:grid-cols-3">
                        {[
                            { k: 'Assets under management', v: FACTS.aum, n: 'Client assets we manage or advise on' },
                            { k: 'Bank total assets', v: FACTS.assets, n: 'The bank’s own balance sheet' },
                            { k: 'Years managing wealth', v: `${yearsOfService()}`, n: `Since ${BRAND.founded}` },
                        ].map((f, i) => (
                            <div key={f.k} className={`border-b border-paper-200 py-6 md:pr-6 ${i > 0 ? 'md:border-l md:pl-6' : ''}`}>
                                <dt className="ht-label text-ink-500 mb-3">{f.k}</dt>
                                <dd>
                                    <span className="block text-figure font-light text-ink-900 tabular">{f.v}</span>
                                    <span className="block text-small text-ink-500">{f.n}</span>
                                    <span className="mt-2 block text-xs text-ink-500">As of {FACTS.asOf}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Advisers */}
            <section aria-labelledby="advisers-heading" className="border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="advisers-heading"
                        label="Advisers"
                        title="Choose a person, not a queue."
                        link={{ href: consult, label: 'Book a consultation' }}
                    />
                    <div className="grid gap-6 md:grid-cols-3">
                        <BankerCard
                            banker={{
                                role: '[Private wealth adviser]',
                                desk: 'Private wealth',
                                languages: 'English, Spanish',
                                hours: '[8:30 AM – 6:00 PM] ET',
                                href: consult,
                            }}
                        />
                        <BankerCard
                            banker={{
                                role: '[Senior trust officer]',
                                desk: 'Trust and estate services',
                                languages: 'English',
                                hours: '[9:00 AM – 5:00 PM] ET',
                                href: consult,
                            }}
                        />
                        <BankerCard
                            banker={{
                                role: '[Portfolio manager]',
                                desk: 'Investment management',
                                languages: 'English, French',
                                hours: '[8:00 AM – 5:00 PM] ET',
                                href: consult,
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Further reading */}
            <section aria-labelledby="reading-heading" className="border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading id="reading-heading" label="Further reading" title="Before your first conversation" />
                    <ul className="grid border-t border-ink-900 md:grid-cols-3 md:gap-x-10">
                        {[
                            { k: 'Trusts · 5 min read', t: 'What a corporate trustee does — and what it can’t', href: '/wealth/trust' },
                            { k: 'Estates · 4 min read', t: 'Planning what you pass on, with your attorney', href: '/wealth/estate' },
                            { k: 'Transparency · 3 min read', t: 'How to read our financial strength figures', href: '/transparency#strength' },
                        ].map((g) => (
                            <li key={g.href} className="border-b border-paper-200">
                                <Link href={g.href} className="group flex h-full flex-col py-6">
                                    <span className="ht-label text-ink-500 mb-3">{g.k}</span>
                                    <span className="text-h4 text-ink-900 group-hover:text-petrol">{g.t}</span>
                                    <span className="mt-4 inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4">
                                        Read <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section aria-label="Disclosures" className="border-t border-paper-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                    <DisclosureBlock
                        items={[
                            {
                                ref: 1,
                                text: 'Investment products are not FDIC insured, are not bank guaranteed and may lose value. Past performance does not guarantee future results.',
                            },
                        ]}
                    />
                </div>
            </section>

            <CtaBand
                id="wealth-cta"
                title="Start with a private conversation."
                body="An adviser will listen first, then tell you plainly whether and how we can help."
                primary={{ href: consult, label: 'Book a private consultation' }}
            />
        </>
    );
}
