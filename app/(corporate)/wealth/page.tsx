import {
    TrendingUp, Shield, Users, Briefcase,
    ArrowRight, CheckCircle, BarChart3, Globe,
    Award, Lock
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES, BANK_INFO } from '@/lib/constants';

export const metadata = {
    title: 'Wealth Management',
    description: 'JP Heritage Bank Wealth Management — personalized investment advisory, trust services, estate planning, and portfolio management for high-net-worth individuals and families.',
};

const services = [
    {
        icon: BarChart3,
        name: 'Investment Advisory',
        description: 'Tailored portfolio construction across equities, fixed income, alternatives, and private markets. Guided by our Investment Policy Committee with $48B+ under advisement.',
        features: ['Risk-adjusted portfolio optimization', 'Direct indexing & tax-loss harvesting', 'ESG-aligned investment strategies', 'Alternative investments & private credit access'],
    },
    {
        icon: Shield,
        name: 'Trust & Estate Services',
        description: 'JP Heritage Bank serves as corporate trustee, executor, and administrator for estates of all complexities. Our trust officers have an average tenure of 18 years.',
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
            {/* Hero */}
            <section className="relative py-28 bg-[#0D2545] overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-[#B8960C]/8 blur-3xl rounded-full" />
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-3xl animate-fade-in-up">
                        <p className="text-sm font-semibold text-[#D4AF7A] uppercase tracking-widest mb-4">Wealth Management</p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                            Your Legacy Deserves More Than a Portfolio.
                        </h1>
                        <p className="text-lg text-white/70 leading-relaxed mb-10">
                            JP Heritage Bank Wealth Management delivers institutional-grade investment advisory, trust services, and family wealth planning — with the personal relationship of a trusted private bank. We don&apos;t just manage your assets. We protect what you&apos;ve built and help it endure.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href={ROUTES.contact}
                                className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white transition-all hover:-translate-y-0.5 shadow-gold-glow"
                            >
                                Schedule a Private Consultation
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href={`tel:${BANK_INFO.phone}`}
                                className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none border-2 border-white/25 text-white hover:bg-white/10 transition-all"
                            >
                                Call {BANK_INFO.phoneDisplay}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-24 bg-off-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Our Services</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Comprehensive Wealth Solutions</h2>
                        <p className="text-charcoal-light max-w-2xl mx-auto">
                            From investment management to multi-generational estate planning, JP Heritage provides the full spectrum of private banking and wealth services — under one relationship.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map(({ icon: Icon, name, description, features }) => (
                            <div key={name} className="bg-white rounded-none p-8 border border-gray-100 hover:shadow-vintage-lg hover:border-[#0D2545]/15 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-[#0D2545]/8 group-hover:bg-[#0D2545] flex items-center justify-center mb-5 transition-colors">
                                    <Icon className="w-6 h-6 text-[#0D2545] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-charcoal mb-3 font-playfair">{name}</h3>
                                <p className="text-charcoal-light text-sm leading-relaxed mb-5">{description}</p>
                                <ul className="space-y-2">
                                    {features.map((f) => (
                                        <li key={f} className="flex items-start gap-3 text-sm text-charcoal-light">
                                            <CheckCircle className="w-4 h-4 text-[#0D2545] flex-shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Tiers */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Service Tiers</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">A Relationship Scaled to Your Wealth</h2>
                        <p className="text-charcoal-light max-w-xl mx-auto">
                            Every JP Heritage wealth client receives a dedicated advisor. The depth of service scales with your relationship.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {minimums.map((tier, i) => (
                            <div key={tier.tier} className={`rounded-none p-8 border transition-all hover:shadow-vintage-lg ${i === 1 ? 'bg-[#0D2545] border-[#0D2545] text-white' : 'bg-white border-gray-100 text-charcoal'}`}>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${i === 1 ? 'bg-[#B8960C]/20 text-[#D4AF7A]' : 'bg-[#0D2545]/8 text-[#0D2545]'}`}>
                                    <Award className="w-3 h-3" />
                                    {tier.tier}
                                </div>
                                <p className={`text-3xl font-bold font-playfair mb-1 ${i === 1 ? 'text-[#D4AF7A]' : 'text-[#0D2545]'}`}>{tier.minimum}</p>
                                <p className={`text-xs mb-6 ${i === 1 ? 'text-white/60' : 'text-charcoal-lighter'}`}>Minimum investable assets</p>
                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((f) => (
                                        <li key={f} className={`flex items-start gap-3 text-sm ${i === 1 ? 'text-white/80' : 'text-charcoal-light'}`}>
                                            <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${i === 1 ? 'text-[#D4AF7A]' : 'text-[#0D2545]'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={ROUTES.contact}
                                    className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${i === 1 ? 'text-[#D4AF7A] hover:text-white' : 'text-[#0D2545] hover:text-[#B8960C]'}`}
                                >
                                    Speak with an advisor
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust / Security */}
            <section className="py-20 bg-[#F0F4FA]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { icon: Lock, stat: '$48B+', label: 'Assets Under Advisement' },
                            { icon: TrendingUp, stat: '136', label: 'Years Managing Private Wealth' },
                            { icon: Briefcase, stat: '98%', label: 'Client Retention Rate' },
                        ].map(({ icon: Icon, stat, label }) => (
                            <div key={label} className="bg-white rounded-none p-8 border border-gray-100">
                                <Icon className="w-8 h-8 text-[#B8960C] mx-auto mb-4" />
                                <p className="text-3xl font-bold font-playfair text-[#0D2545] mb-1">{stat}</p>
                                <p className="text-sm text-charcoal-light">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#0D2545]">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Begin Your Private Banking Relationship
                    </h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">
                        Schedule a confidential consultation with a JP Heritage Wealth advisor. There is no obligation — only an honest conversation about your financial future.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={ROUTES.contact}
                            className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white transition-all hover:-translate-y-0.5"
                        >
                            Request a Consultation
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href={`tel:${BANK_INFO.phone}`}
                            className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none border-2 border-white/25 text-white hover:bg-white/10 transition-all"
                        >
                            Call Our Wealth Team
                        </a>
                    </div>
                    <p className="mt-6 text-xs text-white/30">{BANK_INFO.fdic} Investment products are not FDIC insured, not bank guaranteed, and may lose value.</p>
                </div>
            </section>
        </main>
    );
}
