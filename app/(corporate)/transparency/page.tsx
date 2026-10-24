import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { BRAND, FACTS, PUBLIC_CONTACT } from '@/src/content/facts';
import { PageHero, SectionHeading, FactList, CtaBand } from '@/components/commercial-ui/Isobath';

/**
 * Transparency — the Ledger of Record (UI/UX review, "Signature components").
 * Licences, ratios, policies and documents, each with an as-of date and a
 * source. Every value is a bracketed placeholder until the bank supplies the
 * audited figure; nothing here is invented.
 */

export const metadata: Metadata = {
    title: 'Transparency',
    description: `${BRAND.shortName}'s charter, regulator, capital ratios, deposit protection, policies and documents of record — each with a date and a source.`,
};

const ratios = [
    { label: 'Common equity tier 1 ratio', value: '[00.0]%', minimum: '[4.5]%', fill: 70, tick: 30 },
    { label: 'Total capital ratio', value: '[00.0]%', minimum: '[8.0]%', fill: 75, tick: 45 },
    { label: 'Tier 1 leverage ratio', value: '[0.0]%', minimum: '[4.0]%', fill: 60, tick: 40 },
    { label: 'Liquidity coverage ratio', value: '[000]%', minimum: '100%', fill: 80, tick: 55 },
];

const documents = [
    { title: 'Annual report and audited financial statements', period: 'FY [2025]', published: '[Month DD, YYYY]', file: 'PDF · [0.0] MB' },
    { title: 'Consolidated report of condition and income (call report)', period: 'Q[2] [2026]', published: '[Month DD, YYYY]', file: 'PDF · [0.0] MB' },
    { title: 'Community Reinvestment Act performance evaluation', period: '[2025]', published: '[Month DD, YYYY]', file: 'PDF · [0.0] MB' },
    { title: 'Anti-money-laundering policy statement', period: '[2026]', published: '[Month DD, YYYY]', file: 'PDF · [0.0] MB' },
    { title: 'Privacy notice', period: '[2026]', published: '[Month DD, YYYY]', file: 'Web page', href: ROUTES.privacy },
    { title: 'Accessibility statement', period: '[2026]', published: '[Month DD, YYYY]', file: 'Web page', href: ROUTES.accessibility },
];

const changes = [
    { date: '[Month DD, YYYY]', entry: '[Updated capital ratios to the second-quarter call report.]' },
    { date: '[Month DD, YYYY]', entry: '[Corrected the auditor appointment year, reported by a reader.]' },
    { date: '[Month DD, YYYY]', entry: '[Published the FY2025 annual report.]' },
];

export default function TransparencyPage() {
    return (
        <>
            <PageHero
                label="Transparency"
                title={
                    <>
                        Every figure has a date <span className="ht-em">and a source.</span>
                    </>
                }
                lead={
                    <>
                        Written for clients, regulators, auditors, correspondent banks and journalists alike. If anything
                        here is wrong or out of date,{' '}
                        <Link href={`${ROUTES.contact}?topic=other`} className="ht-link">
                            tell us
                        </Link>{' '}
                        and we will correct it in public.
                    </>
                }
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: ROUTES.about, label: 'About us' },
                    { href: '/transparency', label: 'Transparency' },
                ]}
                aside={
                    <div className="border border-ink-900 p-6">
                        <p className="ht-label text-ink-500 mb-2">Last reviewed</p>
                        <p className="text-h4 text-ink-900 tabular">[Month DD, YYYY]</p>
                        <p className="text-small text-ink-500 mb-6">by [Name], Chief Compliance Officer · next review [Month DD, YYYY]</p>
                        <Link
                            href={`${ROUTES.contact}?topic=other`}
                            className="flex w-full items-center justify-center bg-petrol px-6 text-small font-semibold text-white hover:bg-petrol-700"
                        >
                            Request the due-diligence pack
                        </Link>
                        <nav aria-label="On this page" className="mt-6 grid grid-cols-2 gap-x-4 border-t border-paper-200 pt-4">
                            {[
                                ['#license', '01 Charter'],
                                ['#strength', '02 Strength'],
                                ['#protection', '03 Protection'],
                                ['#policies', '04 Policies'],
                                ['#documents', '05 Documents'],
                                ['#changes', '06 Changes'],
                            ].map(([href, label]) => (
                                <a key={href} href={href} className="flex items-center text-small text-petrol underline underline-offset-4 tabular">
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </div>
                }
            />

            {/* 01 Charter and regulation */}
            <section id="license" aria-labelledby="license-heading" className="scroll-mt-24 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-4">
                        <p className="ht-label text-ink-500 mb-3 tabular">01</p>
                        <h2 id="license-heading" className="text-h2 text-ink-900">
                            Charter and regulation
                        </h2>
                    </div>
                    <div className="lg:col-span-8">
                        <FactList
                            items={[
                                { term: 'Legal entity', value: BRAND.legalEntity },
                                { term: 'Trading name', value: BRAND.shortName },
                                { term: 'Charter', value: `National bank charter [No.], since ${BRAND.founded}` },
                                { term: 'Primary regulator', value: '[Primary federal regulator]' },
                                { term: 'Deposit insurance', value: 'Member FDIC · certificate [#00000]' },
                                { term: 'Head office', value: PUBLIC_CONTACT.address },
                                { term: 'Ownership', value: '[00]% held by [Holding company]' },
                                { term: 'External auditor', value: '[Audit firm], appointed [Year]' },
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* 02 Financial strength */}
            <section id="strength" aria-labelledby="strength-heading" className="ht-dark scroll-mt-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <SectionHeading
                        id="strength-heading"
                        label="02"
                        title="Financial strength"
                        intro="Each ratio is shown against its regulatory minimum, so the margin of safety is visible at a glance."
                        dark
                    />
                    <dl className="grid border-t border-white/25 sm:grid-cols-2 lg:grid-cols-4">
                        {ratios.map((r, i) => (
                            <div key={r.label} className={`border-b border-white/25 py-6 sm:pr-6 ${i % 2 === 1 ? 'sm:border-l sm:pl-6' : ''} ${i > 0 ? 'lg:border-l lg:pl-6' : ''}`}>
                                <dt className="ht-label text-[#AEB8BC] mb-3">{r.label}</dt>
                                <dd>
                                    <span className="block text-figure font-light text-white tabular">{r.value}</span>
                                    <span className="relative mt-4 block h-1 bg-white/20" aria-hidden="true">
                                        <span className="absolute inset-y-0 left-0 bg-white" style={{ width: `${r.fill}%` }} />
                                        <span className="absolute -top-1 h-3 w-0.5 bg-sea-glass" style={{ left: `${r.tick}%` }} />
                                    </span>
                                    <span className="mt-3 flex justify-between text-xs text-[#AEB8BC] tabular">
                                        <span>Minimum {r.minimum}</span>
                                        <span>
                                            At {FACTS.asOf} ·{' '}
                                            <a href="#documents" className="text-sea-glass underline underline-offset-4">
                                                source
                                            </a>
                                        </span>
                                    </span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <dt className="ht-label text-[#AEB8BC] mb-2">Total assets</dt>
                            <dd className="text-data text-white tabular">{FACTS.assets}</dd>
                        </div>
                        <div>
                            <dt className="ht-label text-[#AEB8BC] mb-2">Assets under management</dt>
                            <dd className="text-data text-white tabular">{FACTS.aum}</dd>
                        </div>
                        <div>
                            <dt className="ht-label text-[#AEB8BC] mb-2">Long-term rating</dt>
                            <dd className="text-data text-white tabular">[AA–]</dd>
                        </div>
                        <div>
                            <dt className="ht-label text-[#AEB8BC] mb-2">Rated by</dt>
                            <dd className="text-data text-white">[Agency]</dd>
                        </div>
                    </dl>
                    <p className="mt-10 text-xs text-[#AEB8BC] ht-measure">
                        Bars are drawn to scale from published figures; the lengths shown are placeholders. The sea-glass
                        tick marks each regulatory minimum. Total assets and assets under management are separate
                        measures and are never added together.
                    </p>
                </div>
            </section>

            {/* 03 Protection */}
            <section id="protection" aria-labelledby="protection-heading" className="scroll-mt-24 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-4">
                        <p className="ht-label text-ink-500 mb-3 tabular">03</p>
                        <h2 id="protection-heading" className="text-h2 text-ink-900">
                            How your money is protected
                        </h2>
                    </div>
                    <dl className="lg:col-span-8 border-t border-ink-900">
                        {[
                            {
                                t: 'Deposits',
                                b: 'Insured by the FDIC up to $250,000 per depositor, for each account ownership category. Joint, retirement and trust accounts are separate categories.',
                            },
                            {
                                t: 'Investments and securities',
                                b: 'Held in custody at [Custodian], in client accounts kept separate from the bank’s own assets. They are not FDIC insured and may lose value.',
                            },
                            {
                                t: 'Trust assets',
                                b: 'Owned by the trust for its beneficiaries, recorded separately and examined each year by [Audit firm].',
                            },
                        ].map((p) => (
                            <div key={p.t} className="border-b border-paper-200 py-5">
                                <dt className="text-h4 text-ink-900 mb-1">{p.t}</dt>
                                <dd className="text-body text-ink-700 ht-measure">{p.b}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* 04 Policies */}
            <section id="policies" aria-labelledby="policies-heading" className="scroll-mt-24 border-t border-paper-200 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-4">
                        <p className="ht-label text-ink-500 mb-3 tabular">04</p>
                        <h2 id="policies-heading" className="text-h2 text-ink-900">
                            Policies and financial crime controls
                        </h2>
                    </div>
                    <div className="lg:col-span-8 grid gap-px border-y border-paper-200 bg-paper-200 md:grid-cols-2">
                        {[
                            { t: 'Anti-money-laundering', b: 'Our policy statement, reviewed by the board each year.', link: 'Policy statement (PDF)' },
                            { t: 'Sanctions', b: 'We screen against the OFAC lists and others named in the policy.', link: 'Sanctions policy (PDF)' },
                            { t: 'Complaints', b: 'How to complain, how long we take to answer and where to escalate.', link: 'Complaints process', href: `${ROUTES.contact}?topic=other` },
                            { t: 'Reporting officer', b: 'Contact for counterparties and authorities.', link: '[BSA officer email]' },
                        ].map((p) => (
                            <div key={p.t} className="bg-paper-50 py-6 md:px-6 md:[&:nth-child(odd)]:pl-0">
                                <h3 className="text-h4 text-ink-900 mb-2">{p.t}</h3>
                                <p className="text-small text-ink-700 mb-3">{p.b}</p>
                                {p.href ? (
                                    <Link href={p.href} className="ht-link text-small inline-flex items-center">
                                        {p.link}
                                    </Link>
                                ) : (
                                    <span className="text-small text-ink-500">{p.link} — available on request</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 05 Documents */}
            <section id="documents" aria-labelledby="documents-heading" className="scroll-mt-24 border-t border-paper-200 bg-paper-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading id="documents-heading" label="05" title="Documents of record" />
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-left">
                            <caption className="sr-only">Documents of record</caption>
                            <thead>
                                <tr className="border-b border-ink-900">
                                    {['Document', 'Period', 'Published', 'File'].map((h) => (
                                        <th key={h} scope="col" className="ht-label py-3 pr-6 text-ink-500">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((d) => (
                                    <tr key={d.title} className="border-b border-paper-200">
                                        <th scope="row" className="py-4 pr-6 text-body font-normal">
                                            {d.href ? (
                                                <Link href={d.href} className="ht-link font-normal">
                                                    {d.title}
                                                </Link>
                                            ) : (
                                                <span className="text-ink-900">{d.title}</span>
                                            )}
                                        </th>
                                        <td className="py-4 pr-6 text-small text-ink-700 tabular">{d.period}</td>
                                        <td className="py-4 pr-6 text-small text-ink-700 tabular">{d.published}</td>
                                        <td className="py-4 text-small text-ink-700">{d.file}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-xs text-ink-500">
                        Files are published here once the bank releases them. Until then, ask for any document through the
                        due-diligence request.
                    </p>
                </div>
            </section>

            {/* 06 Changes */}
            <section id="changes" aria-labelledby="changes-heading" className="scroll-mt-24 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-4">
                        <p className="ht-label text-ink-500 mb-3 tabular">06</p>
                        <h2 id="changes-heading" className="text-h2 text-ink-900">
                            Changes to this page
                        </h2>
                    </div>
                    <ol className="lg:col-span-8 border-t border-ink-900">
                        {changes.map((c) => (
                            <li key={c.entry} className="grid gap-2 border-b border-paper-200 py-4 sm:grid-cols-[12rem_1fr]">
                                <span className="text-small text-ink-500 tabular">{c.date}</span>
                                <span className="text-body text-ink-900">{c.entry}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <CtaBand
                id="transparency-cta"
                title="Need something that isn’t here?"
                body="Correspondent banks, auditors and journalists can request any document of record."
                primary={{ href: `${ROUTES.contact}?topic=other`, label: 'Request the due-diligence pack' }}
                secondary={{ href: ROUTES.security, label: 'Security and fraud' }}
            />
        </>
    );
}
