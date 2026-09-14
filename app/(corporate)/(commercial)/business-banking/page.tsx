import {
    CheckCircle, Building2, Briefcase, TrendingUp,
    Users, Globe, ArrowRight, Shield,
    BarChart3, Landmark, PiggyBank, Truck
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES, BANK_INFO } from '@/lib/constants';

export const metadata = {
    title: 'Business Banking',
    description: 'JP Heritage Bank business banking — commercial checking, merchant services, business loans, and treasury management for businesses of every size.',
};

const services = [
    {
        icon: Building2,
        name: 'Business Checking',
        tagline: 'The foundation of your business finances.',
        highlight: '$0 Monthly Fee*',
        color: 'from-[#0D2545] to-[#1B355B]',
        features: [
            'No monthly fee for first 12 months (then $15, waivable)',
            '500 free transactions per month',
            'Same-day ACH origination',
            'Dedicated business debit cards for each authorized user',
            'Positive Pay fraud protection included',
            'QuickBooks® and Xero® direct integration',
        ],
        cta: 'Open Business Account',
    },
    {
        icon: BarChart3,
        name: 'Merchant Services',
        tagline: 'Accept every payment. Never miss a sale.',
        highlight: '0.15% + $0.08/txn',
        color: 'from-[#B8960C] to-[#8A6F07]',
        features: [
            'In-person, online, and mobile payment acceptance',
            'Next-day funding — guaranteed',
            'Virtual terminal for phone and mail orders',
            'Recurring billing and invoicing engine',
            'Level 1 PCI-DSS compliance included',
            'Dedicated merchant support line, 7 days a week',
        ],
        cta: 'Set Up Merchant Services',
    },
    {
        icon: Landmark,
        name: 'Business Loans & Lines',
        tagline: 'Capital when and where you need it most.',
        highlight: 'Up to $5M',
        color: 'from-[#152D50] to-[#0D2545]',
        features: [
            'Term loans from $25,000 to $5,000,000',
            'Business lines of credit: revolving, up to $2M',
            'SBA 7(a) and 504 loan programs available',
            'Equipment financing with up to 100% LTV',
            'Commercial real estate mortgages at competitive rates',
            'Decisions in as little as 48 hours for qualified businesses',
        ],
        cta: 'Explore Business Lending',
    },
    {
        icon: Users,
        name: 'Payroll & HR Banking',
        tagline: 'Pay your team on time, every time.',
        highlight: 'Full-Service',
        color: 'from-[#091C38] to-[#152D50]',
        features: [
            'Integrated payroll processing for W-2 and 1099 workers',
            'Same-day or next-day direct deposit',
            'Tax filing and remittance — automated',
            'Multi-state payroll support',
            'Benefits and HSA account management',
            'Compliance reporting and audit-ready record keeping',
        ],
        cta: 'Set Up Payroll Services',
    },
];

const industries = [
    { icon: Truck, name: 'Logistics & Distribution', description: 'Fleet financing, fuel card programs, and cash flow management for transportation businesses.' },
    { icon: Globe, name: 'Import/Export & Trade', description: 'Letters of credit, trade finance, and multi-currency accounts for international commerce.' },
    { icon: Building2, name: 'Real Estate & Construction', description: 'Construction draw loans, bridge financing, and property management banking solutions.' },
    { icon: Briefcase, name: 'Professional Services', description: 'IOLTA accounts, trust management, and specialized banking for law, healthcare, and accounting firms.' },
    { icon: TrendingUp, name: 'Technology & Startups', description: 'Venture debt, SVB-replacement banking, and equity-linked credit facilities for growth-stage companies.' },
    { icon: PiggyBank, name: 'Non-Profit Organizations', description: 'Zero-fee accounts, grant management tools, and CDFI lending for mission-driven organizations.' },
];

const caseStudies = [
    {
        company: 'Meridian Restaurant Group',
        sector: 'Hospitality',
        result: 'Cut payment processing costs by 34% and eliminated week-long funding delays using JP Heritage Merchant Services.',
        size: '12 Locations',
    },
    {
        company: 'Vantage Tech Solutions',
        sector: 'Software/SaaS',
        result: 'Secured a $1.8M growth line of credit in 5 business days, enabling a critical infrastructure expansion that tripled ARR.',
        size: '45 Employees',
    },
    {
        company: 'Crown Construction LLC',
        sector: 'Commercial Construction',
        result: 'Streamlined draw management for a $22M commercial project through JP Heritage\'s integrated construction lending portal.',
        size: '$40M Revenue',
    },
];

export default function BusinessBankingPage() {
    return (
        <main>
            {/* Hero */}
            <section className="relative py-24 bg-[#0D2545] overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="absolute left-0 bottom-0 w-[500px] h-[400px] bg-[#B8960C]/10 blur-3xl rounded-full" />
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <p className="text-sm font-semibold text-[#D4AF7A] uppercase tracking-widest mb-4">Business Banking</p>
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                                The Bank That Works as Hard as Your Business.
                            </h1>
                            <p className="text-lg text-white/70 mb-8 leading-relaxed">
                                From sole proprietors to mid-market enterprises, JP Heritage Bank delivers commercial banking relationships built on decades of sector expertise — not spreadsheets and scorecards.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={ROUTES.apply} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white transition-all hover:-translate-y-0.5 shadow-gold-glow">
                                    Open Business Account
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href={ROUTES.contact} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none border-2 border-white/25 text-white hover:bg-white/10 transition-all">
                                    Speak with a Relationship Manager
                                </Link>
                            </div>
                        </div>
                        <div className="animate-fade-in-up animate-delay-200">
                            <div className="w-full aspect-[4/3] bg-[#1B355B] rounded-none flex items-center justify-center border border-white/10">
                                <span className="text-sm text-white/40 text-center px-8">[ Image: Professional team reviewing financial reports in a modern office environment ]</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-24 bg-off-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Commercial Solutions</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Banking Built for Business</h2>
                        <p className="text-charcoal-light max-w-2xl mx-auto">
                            JP Heritage Bank goes beyond checking accounts. Our commercial bankers are sector specialists who understand your industry&apos;s unique cash flow dynamics.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <div key={service.name} className="bg-white rounded-none overflow-hidden border border-gray-100 hover:shadow-vintage-lg transition-all group">
                                    <div className={`bg-gradient-to-br ${service.color} p-6 text-white`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <Icon className="w-8 h-8 text-[#D4AF7A]" />
                                            <span className="text-xl font-bold text-[#D4AF7A] font-playfair">{service.highlight}</span>
                                        </div>
                                        <h3 className="text-xl font-bold font-playfair mb-1">{service.name}</h3>
                                        <p className="text-white/70 text-sm">{service.tagline}</p>
                                    </div>
                                    <div className="p-6">
                                        <ul className="space-y-3 mb-6">
                                            {service.features.map((f) => (
                                                <li key={f} className="flex items-start gap-3 text-sm text-charcoal-light">
                                                    <CheckCircle className="w-4 h-4 text-[#0D2545] flex-shrink-0 mt-0.5" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={ROUTES.apply} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D2545] hover:text-[#B8960C] transition-colors group/cta">
                                            {service.cta}
                                            <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Industries */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Sector Expertise</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">We Know Your Industry</h2>
                        <p className="text-charcoal-light max-w-xl mx-auto">
                            Specialized banking relationships mean we understand your business — not just your balance.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {industries.map(({ icon: Icon, name, description }) => (
                            <div key={name} className="p-6 rounded-none border border-gray-100 hover:border-[#0D2545]/20 hover:shadow-vintage-md transition-all group">
                                <div className="w-11 h-11 rounded-xl bg-[#0D2545]/8 group-hover:bg-[#0D2545] flex items-center justify-center mb-4 transition-colors">
                                    <Icon className="w-5 h-5 text-[#0D2545] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-semibold text-charcoal mb-2">{name}</h3>
                                <p className="text-sm text-charcoal-light leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Case studies */}
            <section className="py-24 bg-[#F0F4FA]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Client Success</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Results That Speak for Themselves</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {caseStudies.map((cs) => (
                            <div key={cs.company} className="bg-white p-8 rounded-none border border-gray-100 hover:shadow-vintage-lg transition-all">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs font-semibold bg-[#0D2545]/8 text-[#0D2545] px-3 py-1 rounded-full">{cs.sector}</span>
                                    <span className="text-xs text-charcoal-lighter">{cs.size}</span>
                                </div>
                                <h3 className="font-bold text-charcoal mb-3 font-playfair">{cs.company}</h3>
                                <p className="text-sm text-charcoal-light leading-relaxed">{cs.result}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <Shield className="w-5 h-5 text-[#B8960C]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#0D2545]">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Partner with JP Heritage Bank</h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">
                        Schedule a call with a dedicated relationship manager. No obligation. Just expert advice tailored to your business.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={ROUTES.contact} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white transition-all hover:-translate-y-0.5">
                            Request a Consultation
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href={ROUTES.apply} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none border-2 border-white/25 text-white hover:bg-white/10 transition-all">
                            Apply Online
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
