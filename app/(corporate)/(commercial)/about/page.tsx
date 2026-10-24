import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { BRAND, FACTS, ACQUISITIONS, yearsOfService } from '@/src/content/facts';
import { PageHero, SectionHeading, FactList, TrustBand, CtaBand } from '@/components/commercial-ui/Isobath';

export const metadata: Metadata = {
    title: `About ${BRAND.shortName}`,
    description: `About ${BRAND.shortName} — ${yearsOfService()} years of banking since ${BRAND.founded}, how we are run, and who leads the bank.`,
    openGraph: {
        images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: BRAND.shortName }],
    },
    twitter: { card: 'summary_large_image' },
};

const timeline = [
    {
        date: `${BRAND.founded}`,
        title: `${BRAND.shortName} opens`,
        description: 'A trust and savings bank opens its first office, serving families and local merchants.',
    },
    {
        date: '1999',
        title: 'National charter',
        description: 'The bank takes a national charter and begins to open branches beyond its home state.',
    },
    {
        date: '2007',
        title: 'Investment in digital banking',
        description: 'A structural investment in online banking lays the foundations for the decade ahead.',
    },
    {
        date: '2019',
        title: `${BRAND.vault} launches`,
        description: 'Clients can manage accounts, transfers, bills and cards online and on their phones.',
    },
    ...ACQUISITIONS.map((a) => ({
        date: `${a.year}`,
        title: `${a.name} acquired`,
        description: `${a.name} joins ${BRAND.shortName}; its clients move to ${BRAND.vault}.`,
    })),
];

const leadership = [
    {
        role: '[Chief Executive Officer]',
        remit: 'Leads the bank and chairs the executive committee. Accountable to the board for strategy and conduct.',
    },
    {
        role: '[Chief Financial Officer]',
        remit: 'Responsible for financial reporting, capital, liquidity, treasury and investor relations.',
    },
    {
        role: '[Chief Technology Officer]',
        remit: `Runs technology and digital banking, including ${BRAND.vault} and the bank’s fraud-prevention systems.`,
    },
    {
        role: '[Chief Risk Officer]',
        remit: 'Oversees credit, market, operational and compliance risk, reporting independently to the board risk committee.',
    },
];

export default function AboutPage() {
    return (
        <>
            <PageHero
                label={`About ${BRAND.shortName}`}
                title={
                    <>
                        {yearsOfService()} years of <span className="ht-em">doing it properly.</span>
                    </>
                }
                lead={`We opened in ${BRAND.founded} on a simple belief: banking should make people’s lives easier, not more complicated. That belief still decides what we build, what we charge and how we answer the phone.`}
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: ROUTES.about, label: 'About us' },
                ]}
                aside={
                    <FactList
                        items={[
                            { term: 'In service since', value: `${BRAND.founded}` },
                            { term: 'Total assets', value: FACTS.assets },
                            { term: 'Clients', value: FACTS.clients },
                            { term: 'Surcharge-free ATMs', value: FACTS.atms },
                        ]}
                        caption={
                            <>
                                As of {FACTS.asOf}. Sources on the{' '}
                                <Link href="/transparency" className="ht-link font-normal">
                                    transparency page
                                </Link>
                                .
                            </>
                        }
                    />
                }
            />

            {/* Mission */}
            <section aria-labelledby="mission-heading" className="py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-6">
                        <p className="ht-label text-petrol mb-4">What we stand for</p>
                        <h2 id="mission-heading" className="text-h2 text-ink-900 mb-6">
                            We exist to help people prosper.
                        </h2>
                        <p className="text-body text-ink-700 ht-measure">
                            Every product we design and every policy we write is tested against one question: does this
                            help our clients build better financial lives? If the answer isn’t yes, we don’t do it.
                        </p>
                        <ul className="mt-8 border-t border-ink-900">
                            {[
                                'Every fee published before you apply',
                                'Plain-language disclosures, with the legal text one click below',
                                'Community reinvestment examined under the Community Reinvestment Act',
                                'A named person for every business and wealth relationship',
                            ].map((item) => (
                                <li key={item} className="flex gap-3 border-b border-paper-200 py-3 text-body text-ink-900">
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-petrol" aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <figure className="lg:col-span-6">
                        <div className="relative aspect-[4/3] overflow-hidden bg-paper-100 lg:aspect-[4/5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/ht/building-dusk-1600.webp"
                                srcSet="/images/ht/building-dusk-800.webp 800w, /images/ht/building-dusk-1600.webp 1600w"
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                alt="A limestone bank building at dusk, its tall arched windows lit from inside"
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                    </figure>
                </div>
            </section>

            {/* History */}
            <section id="history" aria-labelledby="history-heading" className="scroll-mt-24 border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-4">
                        <p className="ht-label text-petrol mb-4">History</p>
                        <h2 id="history-heading" className="text-h2 text-ink-900">
                            The record, by date
                        </h2>
                    </div>
                    <ol className="lg:col-span-8 border-t border-ink-900">
                        {timeline.map((item) => (
                            <li key={item.date + item.title} className="grid gap-2 border-b border-paper-200 py-5 sm:grid-cols-[8rem_1fr]">
                                <span className="text-data font-light text-ink-900 tabular">{item.date}</span>
                                <span>
                                    <span className="block text-h4 text-ink-900">{item.title}</span>
                                    <span className="block text-body text-ink-700">{item.description}</span>
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Leadership */}
            <section id="leadership" aria-labelledby="leadership-heading" className="scroll-mt-24 border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        id="leadership-heading"
                        label="Leadership"
                        title="The executive team"
                        intro="Names and photographs are published once each appointment is confirmed. Biographies follow the same format for everyone."
                        link={{ href: '/transparency#license', label: 'Governance and ownership' }}
                    />
                    <ul className="grid gap-px border-y border-paper-200 bg-paper-200 sm:grid-cols-2 lg:grid-cols-4">
                        {leadership.map((l) => (
                            <li key={l.role} className="bg-paper-50 p-6">
                                <div
                                    className="mb-6 flex aspect-[4/5] w-full items-end border border-paper-200 bg-paper-100 p-3"
                                    role="img"
                                    aria-label={`Portrait of the ${l.role.replace(/[[\]]/g, '')} to follow`}
                                >
                                    <span className="text-xs text-ink-500">Portrait to follow</span>
                                </div>
                                <h3 className="text-h4 text-ink-900">{l.role}</h3>
                                <p className="mt-1 text-small text-ink-500">[Name] · since [Year]</p>
                                <p className="mt-4 text-small text-ink-700">{l.remit}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <TrustBand
                items={[
                    {
                        title: 'Deposits insured by the FDIC',
                        body: 'Up to $250,000 per depositor, for each account ownership category.',
                    },
                    {
                        title: 'Independent oversight',
                        body: 'Examined by our federal regulator and audited each year by an external firm.',
                    },
                    {
                        title: 'Published figures',
                        body: 'Capital, liquidity and documents of record, each with a date and a source.',
                    },
                ]}
            />

            <CtaBand
                id="about-cta"
                title="Bank with people who show their work."
                primary={{ href: ROUTES.apply, label: 'Open an account' }}
                secondary={{ href: ROUTES.contact, label: 'Contact us' }}
            />
        </>
    );
}
