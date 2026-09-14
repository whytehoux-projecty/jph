'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/commercial-ui/Button';

interface HeroProps {
    headline: string;
    subheadline: string;
    primaryCTA: { text: string; href: string };
    secondaryCTA?: { text: string; href: string };
    image?: string;
    showEBankingWidget?: boolean;
}

export function Hero({ headline, subheadline, primaryCTA, secondaryCTA, image, showEBankingWidget = false }: HeroProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-heritage-navy/5 to-soft-gold/5 py-20 md:py-32">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="space-y-8 animate-fade-in-up">
                        <h1 className="text-4xl md:text-6xl font-bold text-charcoal leading-tight">
                            {headline}
                        </h1>
                        <p className="text-lg md:text-xl text-charcoal-light leading-relaxed">
                            {subheadline}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={primaryCTA.href}>
                                <Button variant="primary" size="large" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                                    {primaryCTA.text}
                                </Button>
                            </Link>
                            {secondaryCTA && (
                                <Link href={secondaryCTA.href}>
                                    <Button variant="secondary" size="large">
                                        {secondaryCTA.text}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* E-Banking Widget or Image/Visual */}
                    {showEBankingWidget ? (
                        <div className="flex items-center justify-center">
                            {/* E-Banking widget will be imported and used in the homepage */}
                            <div className="w-full max-w-md">
                                {/* Placeholder - will be replaced by actual widget in homepage */}
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-[400px] md:h-[600px] rounded-none overflow-hidden shadow-vintage-xl">
                            {image ? (
                                <Image
                                    src={image}
                                    alt={headline}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-heritage-navy to-heritage-navy-dark flex items-center justify-center">
                                    <div className="text-center text-white p-8">
                                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-soft-gold flex items-center justify-center">
                                            <span className="text-6xl font-playfair font-bold text-charcoal">JPH</span>
                                        </div>
                                        <p className="text-2xl font-playfair font-semibold">EST. 1888</p>
                                        <p className="text-lg mt-2 opacity-90">Banking Without Boundaries</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
