'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    quote: string;
    rating: number;
    image: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: 'Sarah Martinez',
        role: 'Small Business Owner',
        quote: 'JP Heritage Bank has been instrumental in growing my business. Their personalized service and competitive rates made all the difference.',
        rating: 5,
        image: '/images/new/happy-customer-1.jpg'
    },
    {
        id: 2,
        name: 'Robert Chen',
        role: 'Retired Educator',
        quote: 'After 40 years of teaching, I trust JP Heritage Bank with my retirement savings. Their stability and service are unmatched.',
        rating: 5,
        image: '/images/new/happy-customer-2.jpg'
    },
    {
        id: 3,
        name: 'Emily Thompson',
        role: 'Young Professional',
        quote: 'As a first-time account holder, JP Heritage Bank made banking simple and secure. I love their Heritage Vault app!',
        rating: 5,
        image: '/images/new/happy-customer-3.jpg'
    },
];

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    return (
        <section className="py-20 bg-gradient-to-br from-[#0D2545] to-[#091C38]">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust JP Heritage Bank with their financial future
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Testimonial Card */}
                    <div className="bg-white rounded-none shadow-vintage-xl p-8 md:p-12">
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-none border-4 border-heritage-navy/10 mb-6 relative overflow-hidden">
                                <Image
                                    src={testimonials[currentIndex].image}
                                    alt={testimonials[currentIndex].name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-6">
                                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-soft-gold text-soft-gold" />
                                ))}
                            </div>

                            {/* Quote */}
                            &quot;{testimonials[currentIndex].quote}&quot;

                            {/* Author */}
                            <div>
                                <p className="text-lg font-semibold text-charcoal">
                                    {testimonials[currentIndex].name}
                                </p>
                                <p className="text-sm text-charcoal-light">
                                    {testimonials[currentIndex].role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-none bg-white shadow-vintage-lg flex items-center justify-center text-heritage-navy hover:bg-heritage-navy hover:text-white transition-all"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-none bg-white shadow-vintage-lg flex items-center justify-center text-heritage-navy hover:bg-heritage-navy hover:text-white transition-all"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Navigation */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={cn(
                                    'w-3 h-3 rounded-none transition-all',
                                    currentIndex === index
                                        ? 'bg-white w-8'
                                        : 'bg-white/40 hover:bg-white/60'
                                )}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
