import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Users, TrendingUp, Home, Briefcase, CreditCard, HelpCircle, Lock } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    tagline: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    featured?: boolean;
    image?: string;
}

const products: Product[] = [
    {
        id: 'heritage-vault',
        name: 'Heritage Vault™ Accounts',
        tagline: '135 years of keeping your wealth safe',
        description: 'Premium checking and savings accounts with unmatched security and personalized service.',
        icon: <Shield className="w-6 h-6" />,
        href: '/products/heritage-vault',
        featured: true,
        image: '/images/new/family-banking.jpg'
    },
    {
        id: 'legacy-builder',
        name: 'Legacy Builder Savings',
        tagline: 'Build wealth that lasts generations',
        description: 'High-yield savings accounts designed to grow your family\'s financial legacy over time.',
        icon: <TrendingUp className="w-6 h-6" />,
        href: '/products/legacy-builder',
        featured: true,
        image: '/images/new/investment-feature.jpg'
    },
    {
        id: 'golden-years',
        name: 'Golden Years Mortgages',
        tagline: 'Home financing with vintage values',
        description: 'Competitive mortgage rates with personalized service and flexible terms for your dream home.',
        icon: <Home className="w-6 h-6" />,
        href: '/products/mortgages',
        image: '/images/new/loans-feature.jpg'
    },
    {
        id: 'founders-circle',
        name: 'Founders Circle Business',
        tagline: 'Banking for entrepreneurs',
        description: 'Comprehensive business banking solutions with dedicated relationship managers and premium perks.',
        icon: <Briefcase className="w-6 h-6" />,
        href: '/products/business-banking',
        image: '/images/new/modern-office.jpg'
    },
    {
        id: 'vault-credit',
        name: 'Vault Credit Cards',
        tagline: 'Premium rewards, classic service',
        description: 'Exclusive credit cards with cashback rewards, travel benefits, and concierge services.',
        icon: <CreditCard className="w-6 h-6" />,
        href: '/products/credit-cards',
        image: '/images/new/credit-card-feature.jpg'
    },
    {
        id: 'white-glove',
        name: 'White Glove Banking',
        tagline: 'Your dedicated financial advisor',
        description: 'Personal banking with one-on-one guidance, wealth management, and 24/7 priority support.',
        icon: <Users className="w-6 h-6" />,
        href: '/products/private-banking',
        featured: true,
    },
    {
        id: 'security-center',
        name: 'Security Center',
        tagline: 'Bank-grade protection, always',
        description: 'Advanced fraud prevention, identity protection, and account monitoring to keep you safe.',
        icon: <Lock className="w-6 h-6" />,
        href: '/security',
    },
    {
        id: 'help-support',
        name: 'Help & Support',
        tagline: 'We\'re here for you',
        description: '24/7 customer support, FAQs, guides, and in-person assistance at over 200 branches.',
        icon: <HelpCircle className="w-6 h-6" />,
        href: '/help',
    },
];

export function ProductGrid() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-playfair text-charcoal mb-4">
                        Our Banking Solutions
                    </h2>
                    <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                        Tailored to your lifestyle, designed for your success. Explore our complete range of premium banking services.
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={product.href}
                            className={`group relative overflow-hidden rounded-xl border border-white/40 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 ${product.featured ? 'lg:col-span-2' : ''
                                } ${!product.image ? 'bg-white/60 backdrop-blur-lg hover:bg-white/70' : ''}`}
                        >
                            {/* Background Image for Featured/Imaged Cards */}
                            {product.image && (
                                <>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-charcoal/60 group-hover:bg-charcoal/70 transition-colors" />
                                </>
                            )}

                            {/* Content Wrapper (z-index to stay above background) */}
                            <div className="relative z-10">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center mb-4 transition-all ${product.image
                                        ? 'bg-white/20 text-white group-hover:bg-white/30'
                                        : 'bg-heritage-navy/10 text-heritage-navy group-hover:bg-heritage-navy group-hover:text-white'
                                    }`}>
                                    {product.icon}
                                </div>

                                {/* Texts */}
                                <h3 className={`text-xl font-bold font-playfair mb-2 transition-colors ${product.image ? 'text-white' : 'text-charcoal group-hover:text-heritage-navy'
                                    }`}>
                                    {product.name}
                                </h3>
                                <p className={`text-sm font-semibold mb-3 ${product.image ? 'text-soft-gold' : 'text-heritage-navy'
                                    }`}>
                                    {product.tagline}
                                </p>
                                <p className={`text-sm mb-4 ${product.image ? 'text-white/90' : 'text-charcoal-light'
                                    }`}>
                                    {product.description}
                                </p>

                                {/* Learn More Link */}
                                <div className={`flex items-center gap-2 font-semibold text-sm transition-all group-hover:gap-3 ${product.image ? 'text-white' : 'text-heritage-navy'
                                    }`}>
                                    Learn more
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
