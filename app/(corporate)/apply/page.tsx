'use client';

import { Suspense, useState, useEffect } from 'react';
import { BRAND } from '@/src/content/facts';
import { ApplicationWizard } from './ApplicationWizard';

const STEPS = [
    { title: 'Request', text: 'Tell us where you live and which IDs you hold to determine eligibility.', icon: '/assets/apply/step-request.svg' },
    { title: 'Review', text: 'Our onboarding team evaluates your request.', icon: '/assets/apply/step-review.svg' },
    { title: 'Register', text: 'Complete KYC tailored to your country and fund your new account securely.', icon: '/assets/apply/step-register.svg' },
];

const SLIDES = [
    '/assets/apply/apply-slide-1.jpg',
    '/assets/apply/apply-slide-2.jpg',
    '/assets/apply/apply-slide-3.jpg'
];

function SlideshowBackground() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-ink-900">
            <img src="/assets/apply/apply-left-bg.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
            
            {SLIDES.map((src, i) => (
                <div 
                    key={src}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ 
                        opacity: i === index ? 1 : 0, 
                        backgroundImage: `url('${src}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-ink-900 opacity-55" />
        </div>
    );
}

export default function ApplyPage() {
    return (
        <div className="min-h-screen bg-paper-100 flex flex-col md:flex-row">
            {/* Mobile Banner */}
            <div className="md:hidden w-full h-56 bg-cover bg-center" style={{ backgroundImage: "url('/assets/apply/apply-mobile-banner.jpg')" }} />

            {/* Left Sidebar - Split Screen Design */}
            <div className="hidden md:flex w-full md:w-1/3 lg:w-[40%] bg-ink-900 text-paper-50 p-8 md:p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
                <SlideshowBackground />

                <div className="relative z-10">
                    <h1 className="font-display text-h1 mb-4">Open an account</h1>
                    <p className="text-body-lg text-paper-300 mb-12">
                        Secure, relationship-based banking tailored to you. Apply in minutes.
                    </p>

                    <div className="space-y-8">
                        {STEPS.map((s) => (
                            <div key={s.title} className="flex items-start gap-4">
                                <img src={s.icon} alt="" className="w-12 h-12 shrink-0 object-contain" />
                                <div>
                                    <h3 className="font-display text-h4 mb-1">{s.title}</h3>
                                    <p className="text-small text-paper-300">{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 bg-paper-100 text-ink-500">Loading application...</div>}>
                <ApplicationWizard />
            </Suspense>
        </div>
    );
}
