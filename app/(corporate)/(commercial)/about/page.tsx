import {
    Shield, Award, Users, TrendingUp, MapPin,
    ArrowRight, CheckCircle, Globe, Lock, Landmark
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES, BANK_INFO } from '@/lib/constants';

export const metadata = {
    title: 'About JP Heritage Bank',
    description: 'Learn about JP Heritage Bank — 136 years of trusted banking, our leadership team, our mission, and our commitment to every client we serve.',
};

const timeline = [
    {
        year: '1888',
        title: 'The Heritage Begins',
        description: 'Jonathan P. Heritage II founds JP Heritage Trust & Savings in lower Manhattan, serving the emerging merchant class of New York City.',
    },
    {
        year: '1929',
        title: 'Strength Through Crisis',
        description: 'JP Heritage remains solvent and fully operational through the Great Depression, honoring every depositor. Trust earned in adversity defines us to this day.',
    },
    {
        year: '1968',
        title: 'National Expansion',
        description: 'JP Heritage Bank receives its national charter and begins expansion to 12 states, extending our trusted relationship model across the country.',
    },
    {
        year: '2007',
        title: 'Digital Transformation',
        description: 'First major bank to launch a fully integrated online banking platform. Our early investment in digital infrastructure would prove transformative.',
    },
    {
        year: '2019',
        title: 'Heritage Vault Launch',
        description: 'Heritage Vault — our award-winning digital banking platform — launches, bringing institutional-quality banking tools to every client.',
    },
    {
        year: '2026',
        title: 'The Next Chapter',
        description: 'With $48B+ in assets and 2.4M clients in 38 states, JP Heritage Bank continues to grow — guided by the same principles Jonathan P. Heritage instilled in 1888.',
    },
];

const leadership = [
    {
        name: 'Catherine J. Whitmore',
        title: 'President & Chief Executive Officer',
        bio: 'Catherine has led JP Heritage Bank since 2018, driving a 40% growth in assets under management and the successful launch of Heritage Vault. Previously CFO of First Atlantic Bancorp and a Board Member of the Federal Reserve Bank of New York.',
        tenure: 'CEO since 2018',
    },
    {
        name: 'Marcus T. Okonkwo',
        title: 'Chief Financial Officer',
        bio: 'Marcus oversees all financial operations, treasury, and investor relations for JP Heritage. A Harvard Business School graduate with 22 years in institutional finance, he led JP Heritage through two significant acquisitions.',
        tenure: 'CFO since 2020',
    },
    {
        name: 'Dr. Priya Sharma',
        title: 'Chief Technology & Digital Officer',
        bio: 'Priya architects JP Heritage\'s technology strategy, including Heritage Vault and the bank\'s AI-driven fraud prevention infrastructure. Former VP of Technology at Goldman Sachs. Named to Forbes\' Top 50 Women in Finance, 2024.',
        tenure: 'CTDO since 2019',
    },
    {
        name: 'Robert A. Fernandez',
        title: 'Chief Risk Officer',
        bio: 'Robert maintains JP Heritage\'s industry-leading risk posture. With 28 years in banking regulation and risk management — including a decade at the OCC — he ensures we protect every client\'s assets with institutional rigor.',
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
        title: 'FDIC Insured to $250,000',
        description: 'JP Heritage Bank is a Member FDIC. Every deposit account is federally insured, individually, up to $250,000 — with options to extend coverage further.',
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
    { award: '#1 Customer Satisfaction — Regional Banks', body: 'J.D. Power', year: '2025' },
    { award: 'Best Digital Banking Platform', body: 'American Banker', year: '2025' },
    { award: 'Best Place to Work — Financial Services', body: 'Fortune 100', year: '2024' },
    { award: 'Community Impact Award', body: 'FDIC Partnership for Progress', year: '2024' },
    { award: 'Most Innovative Bank — Mid-Market', body: 'Global Finance Magazine', year: '2023' },
    { award: 'Top Performer — CRA Rating', body: 'Office of the Comptroller', year: '2023' },
];

export default function AboutPage() {
    return (
        <main>
            {/* Hero */}
            <section className="relative py-24 bg-[#0D2545] overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-[#B8960C]/8 blur-3xl rounded-full" />
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="max-w-3xl animate-fade-in-up">
                        <p className="text-sm font-semibold text-[#D4AF7A] uppercase tracking-widest mb-4">About JP Heritage Bank</p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                            136 Years of Doing What&apos;s Right.
                        </h1>
                        <p className="text-lg text-white/70 leading-relaxed mb-8">
                            We were founded in 1888 on a single belief: that banking should make people&apos;s lives better, not more complicated. Four generations of clients and 136 years later, that belief still guides every decision we make.
                        </p>
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                            <div>
                                <p className="text-3xl font-bold text-[#D4AF7A] font-playfair">$48B+</p>
                                <p className="text-sm text-white/60 mt-1">Assets Under Management</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#D4AF7A] font-playfair">2.4M+</p>
                                <p className="text-sm text-white/60 mt-1">Clients in 38 States</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#D4AF7A] font-playfair">3,200+</p>
                                <p className="text-sm text-white/60 mt-1">Team Members Nationwide</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-4">Our Mission</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-6">We Exist to Help People Prosper.</h2>
                            <p className="text-charcoal-light leading-relaxed mb-6">
                                Every product we design, every policy we write, and every hire we make is evaluated against one question: does this help our clients build better financial lives? If the answer isn&apos;t yes, we don&apos;t do it.
                            </p>
                            <p className="text-charcoal-light leading-relaxed mb-8">
                                JP Heritage Bank operates with a community reinvestment ratio that exceeds federal requirements by 3x. We are a proud Community Development Financial Institution (CDFI), committed to lending in underserved markets where capital access has historically been limited.
                            </p>
                            <div className="space-y-3">
                                {['Transparent pricing — no surprise fees', 'Community reinvestment at 3x federal requirement', 'Carbon-neutral operations since 2022', 'Pay equity certified by third-party auditors'].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-sm text-charcoal-light">
                                        <CheckCircle className="w-4 h-4 text-[#0D2545] flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="w-full aspect-square bg-[#F0F4FA] rounded-none flex items-center justify-center border border-[#0D2545]/10">
                                <span className="text-sm text-charcoal-lighter text-center px-8">[ Image: JP Heritage Bank branch exterior — classic stone facade with modern signage ]</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-24 bg-[#F0F4FA]">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Our History</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">136 Years of Heritage</h2>
                    </div>
                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-[#0D2545]/15 hidden md:block" />
                        <div className="space-y-8">
                            {timeline.map((item) => (
                                <div key={item.year} className="relative flex gap-8 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-none bg-[#0D2545] text-white flex flex-col items-center justify-center shadow-vintage-md">
                                        <Landmark className="w-4 h-4 text-[#D4AF7A] mb-0.5" />
                                        <span className="text-xs font-bold">{item.year}</span>
                                    </div>
                                    <div className="bg-white rounded-none p-6 flex-1 border border-gray-100 hover:shadow-vintage-md transition-all">
                                        <h3 className="font-semibold text-charcoal mb-2">{item.title}</h3>
                                        <p className="text-sm text-charcoal-light leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section className="py-24 bg-white" id="leadership">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Leadership</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Executive Leadership Team</h2>
                        <p className="text-charcoal-light max-w-xl mx-auto">
                            Our leadership team brings together more than 120 combined years of banking, technology, and regulatory experience.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {leadership.map((leader) => (
                            <div key={leader.name} className="flex gap-5 p-6 rounded-none border border-gray-100 hover:border-[#0D2545]/15 hover:shadow-vintage-md transition-all">
                                {/* Avatar placeholder */}
                                <div className="w-20 h-20 rounded-none bg-[#0D2545]/8 flex-shrink-0 flex items-center justify-center text-[#0D2545]/30 border border-[#0D2545]/10">
                                    <Users className="w-8 h-8" />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-[#B8960C] uppercase tracking-wider">{leader.tenure}</span>
                                    <h3 className="font-bold text-charcoal mt-1 mb-0.5 font-playfair">{leader.name}</h3>
                                    <p className="text-xs text-charcoal-lighter mb-3">{leader.title}</p>
                                    <p className="text-sm text-charcoal-light leading-relaxed">{leader.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="py-24 bg-[#0D2545]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-[#D4AF7A] uppercase tracking-widest mb-3">Security & Compliance</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Security Is Our Highest Priority</h2>
                        <p className="text-white/70 max-w-xl mx-auto">
                            JP Heritage Bank invests more per client in security infrastructure than any other bank of our size. Your money and data are protected by multiple independent layers of defense.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {securityPillars.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="p-6 rounded-none bg-white/8 border border-white/10 hover:bg-white/12 transition-all">
                                <Icon className="w-8 h-8 text-[#D4AF7A] mb-4" />
                                <h3 className="font-semibold text-white mb-2">{title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recognitions */}
            <section className="py-24 bg-off-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-12">
                        <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-widest mb-3">Recognition</p>
                        <h2 className="text-3xl font-bold text-charcoal">Industry Recognition</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recognitions.map((rec) => (
                            <div key={rec.award} className="p-5 bg-white rounded-none border border-gray-100 hover:shadow-vintage-md transition-all">
                                <div className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-[#B8960C] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-charcoal text-sm">{rec.award}</p>
                                        <p className="text-xs text-charcoal-lighter mt-1">{rec.body} · {rec.year}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-charcoal mb-4">Become Part of the Heritage</h2>
                    <p className="text-charcoal-light mb-8">
                        Join 2.4 million clients who trust JP Heritage Bank with their financial futures. Open your account in minutes — or speak with a banker today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={ROUTES.apply} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none bg-[#0D2545] hover:bg-[#1B355B] text-white transition-all hover:-translate-y-0.5">
                            Open an Account
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href={ROUTES.contact} className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-none border-2 border-[#0D2545]/25 text-[#0D2545] hover:bg-[#0D2545]/5 transition-all">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
