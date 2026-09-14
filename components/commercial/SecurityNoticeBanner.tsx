'use client';

import { useState } from 'react';
import { Shield, X } from 'lucide-react';

export function SecurityNoticeBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-heritage-navy/5 border-b border-heritage-navy/20">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-heritage-navy flex-shrink-0" />
                        <p className="text-sm text-charcoal">
                            <span className="font-semibold">Important Security Notice:</span>{' '}
                            JP Heritage Bank will never ask for your password, PIN, or OTP via email or phone.{' '}
                            <a href="/security" className="text-heritage-navy hover:text-heritage-navy-dark font-semibold underline">
                                Learn more about staying safe
                            </a>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-charcoal-lighter hover:text-charcoal transition-colors flex-shrink-0"
                        aria-label="Dismiss notice"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
