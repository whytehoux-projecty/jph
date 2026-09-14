'use client';

import { useEffect, useRef, useState } from 'react';
import { Briefcase, Shield, MapPin } from 'lucide-react';

interface Stat {
    id: number;
    value: number;
    suffix: string;
    label: string;
    icon: React.ReactNode;
}

const stats: Stat[] = [
    {
        id: 1,
        value: 250000,
        suffix: '+',
        label: 'Accounts Opened',
        icon: <Briefcase className="w-8 h-8" />,
    },
    {
        id: 2,
        value: 5.2,
        suffix: 'B',
        label: 'Money Secured',
        icon: <Shield className="w-8 h-8" />,
    },
    {
        id: 3,
        value: 50,
        suffix: '+',
        label: 'Branch Locations',
        icon: <MapPin className="w-8 h-8" />,
    },
];

function useCountUp(end: number, duration: number = 2000, isVisible: boolean) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setCount(Math.floor(progress * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isVisible]);

    return count;
}

function StatCard({ stat, isVisible }: { stat: Stat; isVisible: boolean }) {
    const count = useCountUp(stat.value, 2000, isVisible);

    const formatNumber = (num: number, suffix: string) => {
        if (suffix === 'B') {
            return `$${num.toFixed(1)}${suffix}`;
        }
        return `${num.toLocaleString()}${suffix}`;
    };

    return (
        <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-heritage-navy/10 flex items-center justify-center text-heritage-navy">
                {stat.icon}
            </div>
            <div className="text-4xl md:text-5xl font-playfair font-bold text-heritage-navy">
                {formatNumber(count, stat.suffix)}
            </div>
            <p className="text-lg font-semibold text-charcoal">{stat.label}</p>
        </div>
    );
}

export function Statistics() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        const currentSection = sectionRef.current;
        if (currentSection) {
            observer.observe(currentSection);
        }

        return () => {
            if (currentSection) {
                observer.unobserve(currentSection);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="py-20 bg-parchment">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-playfair text-charcoal mb-4">
                        Our Legacy by the Numbers
                    </h2>
                    <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
                        A history of stability, growth, and unwavering commitment to our clients.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {stats.map((stat) => (
                        <StatCard key={stat.id} stat={stat} isVisible={isVisible} />
                    ))}
                </div>
            </div>
        </section>
    );
}
