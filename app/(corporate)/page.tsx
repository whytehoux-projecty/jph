import {
    Smartphone, ShieldCheck, Globe, Headphones,
    ArrowRight, TrendingUp, Lock, Zap, Award,
    Building2, Users, PiggyBank, CreditCard,
    ChevronRight
} from 'lucide-react';
import { ProductGrid } from '@/components/commercial/ProductGrid';
import BankMergerShowcase from '@/components/commercial/BankMergerShowcase';
import { ROUTES, BANK_INFO } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';

const features = [
    {
        icon: Smartphone,
        title: 'Heritage Vault App',
        description: 'Full-featured mobile banking. Transfer funds, pay bills, and monitor every account — anytime, anywhere.',
    },
    {
        icon: ShieldCheck,
        title: 'Bank-Grade Security',
        description: '256-bit AES encryption, real-time fraud monitoring, and FDIC insurance up to $250,000.',
    },
    {
        icon: Globe,
        title: 'Global Reach',
        description: 'Access 55,000+ ATMs fee-free nationwide. Send international wires to 180+ countries in minutes.',
    },
    {
        icon: Headphones,
        title: 'Dedicated Support',
        description: 'Live bankers available 24/7. No chatbots, no hold music — real expertise, immediately.',
    },
];

const stats = [
    { value: '136+', label: 'Years of Service', icon: Award },
    { value: '$48B+', label: 'Assets Under Management', icon: TrendingUp },
    { value: '2.4M+', label: 'Clients Worldwide', icon: Users },
    { value: '99.99%', label: 'Platform Uptime', icon: Zap },
];

const products = [
    {
        icon: CreditCard,
        name: 'Heritage Checking',
        description: 'Zero monthly fees. Unlimited transactions. Earn 0.30% APY on every dollar.',
        cta: 'Compare accounts',
        href: ROUTES.personalBanking,
        accent: 'from-[#0D2545] to-[#1B355B]',
    },
    {
        icon: PiggyBank,
        name: 'Heritage Savings',
        description: 'High-yield savings with 4.85% APY. No minimums. No hidden fees.',
        cta: 'Start saving',
        href: ROUTES.personalBanking,
        accent: 'from-[#B8960C] to-[#8A6F07]',
    },
    {
        icon: Building2,
        name: 'Business Banking',
        description: 'End-to-end commercial banking — from payroll to commercial real estate lending.',
        cta: 'Explore business',
        href: ROUTES.businessBanking,
        accent: 'from-[#152D50] to-[#0D2545]',
    },
];

export default function Home() {
    return (
        <main>
            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="relative min-h-[92vh] flex items-center overflow-hidden">
                {/* Background image */}
                <Image
                    src="/images/new/banking-hero.jpg"
                    alt=""
                    fill
                    className="object-cover -z-20"
                    priority
                    aria-hidden="true"
                />
                {/* Dark navy overlay — matching portal aesthetic */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#091C38]/95 via-[#0D2545]/88 to-[#1B355B]/80 -z-10" />
                {/* Subtle gold accent glow bottom-right */}
                <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#B8960C]/8 blur-3xl rounded-full -z-10" />

                <div className="container mx-auto px-6 max-w-7xl py-24">
                    <div className="max-w-3xl">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8 animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-[#B8960C] animate-pulse" />
                            <span className="text-sm font-medium text-white/90">Established {BANK_INFO.founded} · Member FDIC</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-8 animate-fade-in-up">
                            Trusted for{' '}
                            <span className="text-[#D4AF7A]">Generations.</span>
                            <br />
                            Built for{' '}
                            <span className="text-[#D4AF7A]">Tomorrow.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-12 max-w-2xl animate-fade-in-up animate-delay-100">
                            JP Heritage Bank has been the financial partner of choice for families, entrepreneurs, and institutions since 1888. Now, with Heritage Vault, we bring that same trusted expertise to your fingertips — 24 hours a day.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-200">
                            <Link
                                href={ROUTES.vault}
                                className="inline-flex items-center justify-center gap-3 h-14 px-8 text-base font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white shadow-gold-glow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Access Heritage Vault
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href={ROUTES.apply}
                                className="inline-flex items-center justify-center gap-2 h-14 px-8 text-base font-semibold rounded-none border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                            >
                                Open an Account
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/10 animate-fade-in-up animate-delay-300">
                            {[
                                'FDIC Insured',
                                '256-bit Encryption',
                                'Equal Housing Lender',
                                '24/7 Support',
                            ].map((badge) => (
                                <div key={badge} className="flex items-center gap-2 text-sm text-white/60">
                                    <ShieldCheck className="w-4 h-4 text-[#B8960C]" />
                                    <span>{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF9F6] to-transparent" />
            </section>

            {/* ── STATS STRIP ──────────────────────────────────── */}
            <section className="bg-white border-b border-gray-100 py-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map(({ value, label, icon: Icon }) => (
                            <div key={label} className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0D2545]/8 mb-3">
                                    <Icon className="w-6 h-6 text-[#0D2545]" />
                                </div>
                                <p className="text-3xl font-bold text-[#0D2545] font-playfair mb-1">{value}</p>
                                <p className="text-sm text-charcoal-light">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY JP HERITAGE ─────────────────────────────── */}
            <section id="services" className="py-24 bg-off-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Why JP Heritage Bank</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-4">
                            Banking That Works As Hard As You Do
                        </h2>
                        <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                            From corner offices to kitchen tables, JP Heritage Bank delivers institutional-grade financial tools to every client — without the institutional complexity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="p-6 rounded-none bg-white border border-gray-100 hover:border-[#0D2545]/20 hover:shadow-vintage-lg transition-all duration-300 group cursor-default"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#0D2545]/8 group-hover:bg-[#0D2545] flex items-center justify-center mb-5 transition-colors duration-200">
                                    <Icon className="w-6 h-6 text-[#0D2545] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-lg font-semibold text-charcoal mb-2">{title}</h3>
                                <p className="text-sm text-charcoal-light leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED PRODUCTS ────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Our Products</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">
                                Financial Solutions for Every Stage of Life
                            </h2>
                        </div>
                        <div className="flex items-end">
                            <p className="text-charcoal-light">
                                Whether you&apos;re opening your first account, growing a business, or planning your estate — JP Heritage Bank has the right product for your moment.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {products.map((product) => {
                            const Icon = product.icon;
                            return (
                                <div
                                    key={product.name}
                                    className={`relative p-8 rounded-none bg-gradient-to-br ${product.accent} text-white overflow-hidden group`}
                                >
                                    {/* Decorative circle */}
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
                                    <Icon className="w-8 h-8 mb-4 text-[#D4AF7A]" />
                                    <h3 className="text-xl font-semibold mb-3 font-playfair">{product.name}</h3>
                                    <p className="text-white/70 text-sm leading-relaxed mb-6">{product.description}</p>
                                    <Link
                                        href={product.href}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF7A] hover:text-white group/link transition-colors"
                                    >
                                        {product.cta}
                                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <Link
                            href={ROUTES.personalBanking}
                            className="inline-flex items-center gap-2 text-[#0D2545] font-semibold hover:text-[#B8960C] transition-colors"
                        >
                            View all products &amp; services
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FULL PRODUCT GRID ────────────────────────────── */}
            <ProductGrid />

            {/* ── HERITAGE VAULT CTA ───────────────────────────── */}
            <section className="py-24 bg-[#0D2545] relative overflow-hidden">
                {/* Subtle world map texture overlay */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#B8960C]/10 blur-3xl rounded-full" />

                <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-[#B8960C] mb-8 shadow-gold-glow">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Your Bank. In Your Hands.
                        <br />
                        <span className="text-[#D4AF7A]">Anytime. Anywhere.</span>
                    </h2>
                    <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                        Heritage Vault gives you the full power of JP Heritage Bank in a secure, beautifully designed digital platform. Check balances, transfer funds, pay bills, manage cards — all from one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={ROUTES.vault}
                            className="inline-flex items-center justify-center gap-3 h-14 px-10 text-base font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white shadow-gold-glow hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Sign In to Heritage Vault
                        </Link>
                        <Link
                            href={ROUTES.apply}
                            className="inline-flex items-center justify-center gap-2 h-14 px-10 text-base font-semibold rounded-none border-2 border-white/25 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
                        >
                            Open a New Account
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-white/40">{BANK_INFO.fdic}</p>
                </div>
            </section>

            {/* ── PARTNER/TRUST CAROUSEL ──────────────────────── */}
            <BankMergerShowcase />
        </main>
    );
}
