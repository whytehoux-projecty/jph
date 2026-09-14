import {
    CheckCircle, ShieldCheck, Smartphone, Clock,
    CreditCard, PiggyBank, Landmark, ArrowRight,
    Percent, TrendingUp, Zap, Star
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES, BANK_INFO } from '@/lib/constants';

export const metadata = {
    title: 'Personal Banking',
    description: 'JP Heritage Bank personal banking — checking, savings, credit cards, and personal loans designed to help you build lasting financial security.',
};

const accounts = [
    {
        name: 'Heritage Checking',
        tagline: 'For everyday spending and life on the move.',
        icon: CreditCard,
        highlight: '0.30% APY',
        color: 'from-[#0D2545] to-[#1B355B]',
        features: [
            'No monthly maintenance fees — ever',
            'Unlimited domestic ATM fee refunds',
            'Real-time transaction alerts',
            'Zelle® and instant peer transfers',
            'Early direct deposit (up to 2 days early)',
            'FDIC insured up to $250,000',
        ],
        cta: 'Open Checking Account',
    },
    {
        name: 'Heritage Savings',
        tagline: 'Grow your money faster with elite rates.',
        icon: PiggyBank,
        highlight: '4.85% APY',
        color: 'from-[#B8960C] to-[#8A6F07]',
        features: [
            '4.85% APY — among the highest nationally',
            'No minimum balance requirement',
            'Unlimited deposits, up to 6 withdrawals/month',
            'Automatic savings rules and round-ups',
            'Compound interest calculated daily',
            'FDIC insured up to $250,000',
        ],
        cta: 'Open Savings Account',
    },
    {
        name: 'Heritage Rewards Visa®',
        tagline: 'Earn on every purchase you already make.',
        icon: Star,
        highlight: '2.5% Cash Back',
        color: 'from-[#152D50] to-[#0D2545]',
        features: [
            '2.5% unlimited cash back on all purchases',
            '0% APR for 15 months on purchases & transfers',
            '$200 welcome bonus after $1,500 spend in 90 days',
            'No foreign transaction fees',
            'Travel accident insurance & purchase protection',
            'EMV chip + virtual card for Heritage Vault',
        ],
        cta: 'Apply for Credit Card',
    },
    {
        name: 'Personal Loan',
        tagline: 'Flexible financing for life\'s important moments.',
        icon: Landmark,
        highlight: 'From 6.49% APR',
        color: 'from-[#091C38] to-[#0D2545]',
        features: [
            'Borrow $2,500 – $100,000',
            'Fixed rates from 6.49% APR (subject to credit approval)',
            'Terms from 12 to 84 months',
            'No prepayment penalty',
            'Same-business-day funding for approved applications',
            'Relationship rate discount for Heritage Vault clients',
        ],
        cta: 'Apply for Personal Loan',
    },
];

const benefits = [
    { icon: Smartphone, title: 'Heritage Vault Digital Banking', description: 'Full-featured mobile and web access. Deposit checks, pay bills, send wires, manage cards — 24/7.' },
    { icon: ShieldCheck, title: 'Fraud Shield™ Protection', description: 'AI-driven real-time fraud monitoring with instant alerts and zero liability on unauthorized transactions.' },
    { icon: Clock, title: 'Extended Branch Hours', description: 'Branches open Monday–Saturday with Sunday hours at select locations. Phone support 24/7/365.' },
    { icon: TrendingUp, title: 'Financial Wellness Tools', description: 'Built-in budgeting, goal tracking, and spending insights inside Heritage Vault to keep you on track.' },
    { icon: Zap, title: 'Instant Account Opening', description: 'Open any personal account online in under 5 minutes. No paperwork. No branch visit required.' },
    { icon: Percent, title: 'Relationship Rewards', description: 'The more you bank with JP Heritage, the more you save. Rate discounts and fee waivers for multi-product clients.' },
];

export default function PersonalBankingPage() {
    return (
        <main>
            {/* Hero */}
            <section className="relative py-24 bg-[#0D2545] overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[#B8960C]/10 blur-3xl rounded-full" />
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <p className="text-sm font-semibold text-[#D4AF7A] uppercase tracking-widest mb-4">Personal Banking</p>
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                                Your Financial Life, Simplified.
                            </h1>
                            <p className="text-lg text-white/70 mb-8 leading-relaxed">
                                From your first savings account to your family&apos;s mortgage, JP Heritage Bank offers products built around your life — not our bottom line. Rated #1 in client satisfaction for 8 consecutive years.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={ROUTES.apply} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white transition-all hover:-translate-y-0.5 shadow-gold-glow">
                                    Open an Account
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href={ROUTES.vault} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none border-2 border-white/25 text-white hover:bg-white/10 transition-all">
                                    Sign In to Heritage Vault
                                </Link>
                            </div>
                        </div>
                        <div className="animate-fade-in-up animate-delay-200">
                            {/* Image placeholder */}
                            <div className="w-full aspect-[4/3] bg-[#1B355B] rounded-none flex items-center justify-center border border-white/10">
                                <span className="text-sm text-white/40 text-center px-8">[ Image: JP Heritage Bank mobile app — Heritage Vault dashboard on phone ]</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Accounts */}
            <section className="py-24 bg-off-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Our Products</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Personal Banking Products</h2>
                        <p className="text-charcoal-light max-w-2xl mx-auto">
                            Thoughtfully designed accounts that put more money in your pocket and less stress in your life.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {accounts.map((account) => {
                            const Icon = account.icon;
                            return (
                                <div key={account.name} className="bg-white rounded-none overflow-hidden border border-gray-100 hover:shadow-vintage-lg transition-all duration-300 group">
                                    {/* Card header */}
                                    <div className={`bg-gradient-to-br ${account.color} p-6 text-white`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <Icon className="w-8 h-8 text-[#D4AF7A]" />
                                            <span className="text-2xl font-bold font-playfair text-[#D4AF7A]">{account.highlight}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1 font-playfair">{account.name}</h3>
                                        <p className="text-white/70 text-sm">{account.tagline}</p>
                                    </div>
                                    {/* Features */}
                                    <div className="p-6">
                                        <ul className="space-y-3 mb-6">
                                            {account.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-3 text-sm text-charcoal-light">
                                                    <CheckCircle className="w-4 h-4 text-[#0D2545] flex-shrink-0 mt-0.5" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={ROUTES.apply}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D2545] hover:text-[#B8960C] transition-colors group/cta"
                                        >
                                            {account.cta}
                                            <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">The JP Heritage Difference</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">More Than a Bank Account</h2>
                        <p className="text-charcoal-light max-w-xl mx-auto">
                            Every JP Heritage relationship comes with tools and services designed to help you genuinely prosper.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="p-6 rounded-none border border-gray-100 hover:border-[#0D2545]/20 hover:shadow-vintage-md transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-[#0D2545]/8 group-hover:bg-[#0D2545] flex items-center justify-center mb-4 transition-colors">
                                    <Icon className="w-6 h-6 text-[#0D2545] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
                                <p className="text-sm text-charcoal-light leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#0D2545]">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Bank with JP Heritage?</h2>
                    <p className="text-white/70 mb-8">Open your account online in 5 minutes. No branch visit. No paperwork. Just simple, trusted banking.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={ROUTES.apply} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none bg-[#B8960C] hover:bg-[#D4AF7A] text-white transition-all hover:-translate-y-0.5">
                            Open Account Now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href={ROUTES.contact} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none border-2 border-white/25 text-white hover:bg-white/10 transition-all">
                            Speak with a Banker
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
