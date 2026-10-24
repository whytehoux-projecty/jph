import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from './cn';

/**
 * Isobath components, adapted to Heritage Trust.
 *
 * The building blocks named in the UI/UX review ("Signature components carried
 * over", "Layout and components"): a static page hero with one primary action,
 * section headings, the Ledger strip, doorway cards, the rate table, banker
 * cards, a step timeline, a disclosure list and the closing call-to-action.
 *
 * All are server components. One radius (2 px), 1 px rules, no shadows,
 * petrol as the only action colour, tabular figures for every number.
 */

// ─── Actions ──────────────────────────────────────────────────────────────────

type ActionProps = {
    href: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'link' | 'on-dark';
    className?: string;
};

export function Action({ href, children, variant = 'primary', className }: ActionProps) {
    const styles = {
        primary: 'bg-petrol text-white border border-petrol hover:bg-petrol-700 px-6',
        secondary: 'border border-ink-900 text-ink-900 hover:bg-paper-100 px-6',
        'on-dark': 'bg-sea-glass text-heritage-ink border border-sea-glass hover:bg-white hover:border-white px-6',
        link: 'text-petrol underline underline-offset-4 decoration-1 hover:decoration-2 gap-2',
    }[variant];
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center justify-center text-small font-semibold transition-colors',
                styles,
                className,
            )}
        >
            {children}
            {variant === 'link' && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
        </Link>
    );
}

// ─── Page hero — static, one primary action ───────────────────────────────────

type PageHeroProps = {
    label: string;
    title: React.ReactNode;
    lead: React.ReactNode;
    primary?: { href: string; label: string };
    secondary?: { href: string; label: string };
    breadcrumb?: { href: string; label: string }[];
    aside?: React.ReactNode;
    note?: React.ReactNode;
    id?: string;
};

export function PageHero({ label, title, lead, primary, secondary, breadcrumb, aside, note, id = 'page-heading' }: PageHeroProps) {
    return (
        <section aria-labelledby={id} className="border-b border-paper-200 bg-paper-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-24">
                {breadcrumb && (
                    <nav aria-label="Breadcrumb" className="mb-10">
                        <ol className="flex flex-wrap items-center gap-x-2 text-small text-ink-500">
                            {breadcrumb.map((b, i) => (
                                <li key={b.href} className="flex items-center gap-2">
                                    {i > 0 && <span aria-hidden="true">/</span>}
                                    {i < breadcrumb.length - 1 ? (
                                        <Link href={b.href} className="inline-flex items-center underline underline-offset-4 hover:text-petrol">
                                            {b.label}
                                        </Link>
                                    ) : (
                                        <span aria-current="page">{b.label}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}
                <div className={cn('grid gap-12', aside && 'lg:grid-cols-12 lg:gap-16 lg:items-end')}>
                    <div className={cn(aside ? 'lg:col-span-7' : 'max-w-4xl', 'animate-fade-in-up')}>
                        <p className="ht-label text-petrol mb-6">{label}</p>
                        <h1 id={id} className="text-display-lg text-ink-900 mb-6">
                            {title}
                        </h1>
                        <p className="text-lead text-ink-700 ht-measure mb-10">{lead}</p>
                        {(primary || secondary) && (
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
                                {primary && <Action href={primary.href}>{primary.label}</Action>}
                                {secondary && (
                                    <Action href={secondary.href} variant="link">
                                        {secondary.label}
                                    </Action>
                                )}
                            </div>
                        )}
                        {note && <p className="mt-8 text-small text-ink-500 ht-measure">{note}</p>}
                    </div>
                    {aside && <div className="lg:col-span-5">{aside}</div>}
                </div>
            </div>
        </section>
    );
}

// ─── Section heading ──────────────────────────────────────────────────────────

type SectionHeadingProps = {
    id: string;
    label?: string;
    title: React.ReactNode;
    intro?: React.ReactNode;
    link?: { href: string; label: string };
    dark?: boolean;
    className?: string;
};

export function SectionHeading({ id, label, title, intro, link, dark, className }: SectionHeadingProps) {
    return (
        <div className={cn('grid gap-6 lg:grid-cols-12 lg:gap-16 mb-12 lg:mb-16', className)}>
            <div className="lg:col-span-7">
                {label && <p className={cn('ht-label mb-4', dark ? 'text-sea-glass' : 'text-petrol')}>{label}</p>}
                <h2 id={id} className={`text-h2 ${dark ? 'text-white' : 'text-ink-900'}`}>
                    {title}
                </h2>
            </div>
            {(intro || link) && (
                <div className="lg:col-span-5 lg:self-end space-y-4">
                    {intro && <p className={`text-body ${dark ? 'text-[#AEB8BC]' : 'text-ink-700'}`}>{intro}</p>}
                    {link && (
                        <Link
                            href={link.href}
                            className={cn(
                                'inline-flex items-center gap-2 text-small font-semibold underline underline-offset-4',
                                dark ? 'text-sea-glass' : 'text-petrol',
                            )}
                        >
                            {link.label}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Fact list (hero aside, key terms) ────────────────────────────────────────

export function FactList({ items, caption }: { items: { term: string; value: React.ReactNode }[]; caption?: React.ReactNode }) {
    return (
        <div>
            <dl className="border-t border-ink-900">
                {items.map((it) => (
                    <div key={it.term} className="flex items-baseline justify-between gap-6 border-b border-paper-200 py-3">
                        <dt className="text-small text-ink-500">{it.term}</dt>
                        <dd className="text-body text-ink-900 tabular text-right">{it.value}</dd>
                    </div>
                ))}
            </dl>
            {caption && <p className="mt-3 text-xs text-ink-500">{caption}</p>}
        </div>
    );
}

// ─── Ledger strip — every figure has an as-of date and a source ───────────────

export type LedgerFigure = {
    label: string;
    value: string;
    note: string;
    asOf: string;
    source: { label: string; href: string };
};

export function LedgerStrip({
    id,
    title,
    intro,
    figures,
    action,
    footnote,
}: {
    id: string;
    title: React.ReactNode;
    intro?: React.ReactNode;
    figures: LedgerFigure[];
    action?: { href: string; label: string };
    footnote?: React.ReactNode;
}) {
    return (
        <section aria-labelledby={id} className="ht-dark">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                <SectionHeading id={id} label="The ledger" title={title} intro={intro} dark />
                <dl className="grid grid-cols-1 border-t border-white/25 sm:grid-cols-2 lg:grid-cols-4">
                    {figures.map((f, i) => (
                        <div
                            key={f.label}
                            className={cn(
                                'border-b border-white/25 py-6 sm:pr-6',
                                i % 2 === 1 && 'sm:border-l sm:pl-6',
                                i > 0 && 'lg:border-l lg:pl-6',
                            )}
                        >
                            <dt className="ht-label text-[#AEB8BC] mb-3">{f.label}</dt>
                            <dd>
                                <span className="block text-figure font-light text-white tabular">{f.value}</span>
                                <span className="mt-2 block text-small text-[#AEB8BC]">{f.note}</span>
                                <span className="mt-3 block text-xs text-[#AEB8BC]">
                                    As of {f.asOf} ·{' '}
                                    <Link href={f.source.href} className="text-sea-glass underline underline-offset-4">
                                        {f.source.label}
                                    </Link>
                                </span>
                            </dd>
                        </div>
                    ))}
                </dl>
                {(action || footnote) && (
                    <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        {footnote && <p className="text-xs text-[#AEB8BC] ht-measure">{footnote}</p>}
                        {action && (
                            <Link
                                href={action.href}
                                className="inline-flex items-center gap-2 text-small font-semibold text-sea-glass underline underline-offset-4"
                            >
                                {action.label}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── Doorway cards ────────────────────────────────────────────────────────────

export type Doorway = {
    number: string;
    label: string;
    title: string;
    body: string;
    href: string;
    linkLabel: string;
    figure?: { value: string; label: string };
    image?: { src: string; alt: string };
};

export function DoorwayGrid({ doors }: { doors: Doorway[] }) {
    return (
        <ul className={cn('grid gap-px bg-paper-200 border-y border-paper-200', doors.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3')}>
            {doors.map((d) => (
                <li key={d.href} className="bg-paper-50">
                    <Link href={d.href} className="group flex h-full flex-col">
                        {d.image && (
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-100">
                                <Image
                                    src={d.image.src}
                                    alt={d.image.alt}
                                    fill
                                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.02]"
                                />
                            </div>
                        )}
                        <div className="flex grow flex-col p-6 lg:p-8">
                            <p className="ht-label text-ink-500 mb-4">
                                <span className="tabular">{d.number}</span> · {d.label}
                            </p>
                            <h3 className="text-h3 text-ink-900 mb-3 group-hover:text-petrol transition-colors">{d.title}</h3>
                            <p className="text-body text-ink-700 grow">{d.body}</p>
                            {d.figure && (
                                <p className="mt-6 border-t border-paper-200 pt-4">
                                    <span className="block text-data text-ink-900 tabular">{d.figure.value}</span>
                                    <span className="block text-small text-ink-500">{d.figure.label}</span>
                                </p>
                            )}
                            <span className="mt-6 inline-flex items-center gap-2 text-small font-semibold text-petrol underline underline-offset-4">
                                {d.linkLabel}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </span>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

// ─── Rate / comparison table ──────────────────────────────────────────────────

export type RateRow = {
    product: string;
    href?: string;
    description?: string;
    cells: React.ReactNode[];
};

export function RateTable({
    caption,
    columns,
    rows,
    asOf,
}: {
    caption: string;
    columns: string[];
    rows: RateRow[];
    asOf?: string;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">{caption}</caption>
                <thead>
                    <tr className="border-b border-ink-900">
                        <th scope="col" className="ht-label text-ink-500 py-3 pr-6 font-semibold">
                            Product
                        </th>
                        {columns.map((c) => (
                            <th key={c} scope="col" className="ht-label text-ink-500 py-3 pr-6 font-semibold text-right last:pr-0">
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.product} className="border-b border-paper-200 align-top">
                            <th scope="row" className="py-4 pr-6 font-normal">
                                {r.href ? (
                                    <Link href={r.href} className="text-body font-semibold text-ink-900 underline underline-offset-4 decoration-paper-200 hover:text-petrol hover:decoration-petrol">
                                        {r.product}
                                    </Link>
                                ) : (
                                    <span className="text-body font-semibold text-ink-900">{r.product}</span>
                                )}
                                {r.description && <span className="block text-small text-ink-500">{r.description}</span>}
                            </th>
                            {r.cells.map((cell, i) => (
                                <td key={i} className="py-4 pr-6 text-right text-body text-ink-900 tabular last:pr-0">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {asOf && <p className="mt-3 text-xs text-ink-500">{asOf}</p>}
        </div>
    );
}

// ─── Banker card — role-titled, with a neutral portrait frame ─────────────────

export type Banker = {
    role: string;
    desk: string;
    languages: string;
    hours: string;
    href: string;
};

export function BankerCard({ banker }: { banker: Banker }) {
    return (
        <article className="flex flex-col border border-paper-200 bg-paper-50 p-6">
            <div className="flex items-start gap-4">
                <div
                    className="flex h-20 w-16 shrink-0 items-center justify-center border border-paper-200 bg-paper-100"
                    role="img"
                    aria-label="Portrait to follow"
                >
                    <span className="ht-label text-ink-500">Photo</span>
                </div>
                <div>
                    <h3 className="text-h4 text-ink-900">{banker.role}</h3>
                    <p className="text-small text-ink-500">{banker.desk}</p>
                </div>
            </div>
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small">
                <dt className="text-ink-500">Languages</dt>
                <dd className="text-ink-900">{banker.languages}</dd>
                <dt className="text-ink-500">Desk hours</dt>
                <dd className="text-ink-900 tabular">{banker.hours}</dd>
            </dl>
            <Link
                href={banker.href}
                className="mt-6 inline-flex w-fit items-center justify-center border border-ink-900 px-5 text-small font-semibold text-ink-900 hover:bg-paper-100"
            >
                Book a call
            </Link>
        </article>
    );
}

// ─── Step timeline ────────────────────────────────────────────────────────────

export function StepTimeline({ steps }: { steps: { when: string; title: string; body: string }[] }) {
    return (
        <ol className={cn('grid gap-8 md:grid-cols-2 lg:gap-0', { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[steps.length])}>
            {steps.map((s, i) => (
                <li key={s.title} className="relative lg:pr-8">
                    <div className="mb-4 flex items-center gap-3" aria-hidden="true">
                        <span className={cn('h-3 w-3 rounded-full border-2 border-petrol', i === 0 || i === steps.length - 1 ? 'bg-petrol' : 'bg-paper-50')} />
                        <span className="h-px grow bg-ink-900" />
                    </div>
                    <p className="ht-label text-ink-500 mb-2 tabular">{s.when}</p>
                    <h3 className="text-h4 text-ink-900 mb-2">{s.title}</h3>
                    <p className="text-small text-ink-700">{s.body}</p>
                </li>
            ))}
        </ol>
    );
}

// ─── Questions (native disclosure, no JavaScript) ─────────────────────────────

export function QuestionList({ items }: { items: { q: string; a: React.ReactNode }[] }) {
    return (
        <div className="border-t border-ink-900">
            {items.map((it) => (
                <details key={it.q} className="group border-b border-paper-200">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-body font-semibold text-ink-900 hover:text-petrol [&::-webkit-details-marker]:hidden">
                        {it.q}
                        <span aria-hidden="true" className="text-h4 font-light text-petrol transition-transform group-open:rotate-45">
                            +
                        </span>
                    </summary>
                    <div className="pb-6 text-body text-ink-700 ht-measure">{it.a}</div>
                </details>
            ))}
        </div>
    );
}

// ─── Closing band — one action ────────────────────────────────────────────────

export function CtaBand({
    id,
    title,
    body,
    primary,
    secondary,
}: {
    id: string;
    title: React.ReactNode;
    body?: React.ReactNode;
    primary: { href: string; label: string };
    secondary?: { href: string; label: string };
}) {
    return (
        <section aria-labelledby={id} className="ht-dark">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:px-8 py-20 lg:grid-cols-12 lg:items-end lg:py-24">
                <div className="lg:col-span-7">
                    <h2 id={id} className="text-h2 text-white">
                        {title}
                    </h2>
                    {body && <p className="mt-6 text-lead text-[#AEB8BC] ht-measure">{body}</p>}
                </div>
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center lg:col-span-5 lg:justify-end">
                    <Action href={primary.href} variant="on-dark">
                        {primary.label}
                    </Action>
                    {secondary && (
                        <Link
                            href={secondary.href}
                            className="inline-flex items-center text-small font-semibold text-sea-glass underline underline-offset-4"
                        >
                            {secondary.label}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

// ─── Trust band — one link to Security and Transparency ───────────────────────

export function TrustBand({ items }: { items: { title: string; body: string }[] }) {
    return (
        <section aria-labelledby="trust-heading" className="border-t border-paper-200 bg-paper-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-4">
                        <p className="ht-label text-petrol mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Security
                        </p>
                        <h2 id="trust-heading" className="text-h2 text-ink-900">
                            How we keep your money safe.
                        </h2>
                        <div className="mt-6 flex flex-col gap-3">
                            <Action href="/security" variant="link">
                                Security and how to verify us
                            </Action>
                            <Action href="/transparency" variant="link">
                                Read the transparency page
                            </Action>
                        </div>
                    </div>
                    <dl className="lg:col-span-8 grid gap-px bg-paper-200 border-y border-paper-200 md:grid-cols-3">
                        {items.map((it) => (
                            <div key={it.title} className="bg-paper-100 py-6 md:px-6 md:first:pl-0">
                                <dt className="text-h4 text-ink-900 mb-2">{it.title}</dt>
                                <dd className="text-small text-ink-700">{it.body}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}

// ─── Ledger rule plate — the Heritage Trust motif (decorative) ────────────────

export function LedgerPlate({ className, label }: { className?: string; label?: string }) {
    const rows = Array.from({ length: 14 });
    return (
        <div className={cn('relative overflow-hidden bg-paper-100', className)} aria-hidden="true">
            <svg viewBox="0 0 480 448" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                {rows.map((_, i) => (
                    <line key={i} x1="0" x2="480" y1={32 * (i + 1)} y2={32 * (i + 1)} stroke="#D5DBDA" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                ))}
                <line x1="72" x2="72" y1="0" y2="448" stroke="#0E4A55" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <line x1="360" x2="360" y1="0" y2="448" stroke="#D5DBDA" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <line x1="420" x2="420" y1="0" y2="448" stroke="#D5DBDA" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            {label && <span className="absolute bottom-3 left-3 bg-paper-50 px-2 py-1 text-xs text-ink-500">{label}</span>}
        </div>
    );
}
