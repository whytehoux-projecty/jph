'use client';

import { useState } from 'react';
import { Shield, X } from 'lucide-react';

export function SecurityNoticeBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-ink-900/5 border-b border-ink-900/20">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-ink-900 shrink-0" />
                        <p className="text-sm text-ink-900">
                            <span className="font-semibold">Important Security Notice:</span>{' '}
                            Heritage Trust will never ask for your password, PIN, or OTP via email or phone.{' '}
                            <a href="/security" className="text-ink-900 hover:text-ink-900 font-semibold underline">
                                Learn more about staying safe
                            </a>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-ink-500er hover:text-ink-900 transition-colors shrink-0"
                        aria-label="Dismiss notice"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
