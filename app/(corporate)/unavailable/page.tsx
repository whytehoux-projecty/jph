'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, Home, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ROUTES, BANK_INFO } from '@/lib/constants';

export default function ServiceUnavailablePage() {
    const [retryCount, setRetryCount] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    const checkServiceStatus = async () => {
        setIsChecking(true);
        try {
            const res = await fetch('/api/health', {
                method: 'GET',
                cache: 'no-store',
            });
            if (res.ok) {
                window.location.href = '/login';
            }
        } catch {
            console.log('Portal still unavailable');
        } finally {
            setIsChecking(false);
            setRetryCount(prev => prev + 1);
        }
    };

    useEffect(() => {
        const interval = setInterval(checkServiceStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="flex-1 flex items-center justify-center py-16 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Service Unavailable Card */}
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 md:p-12 text-center">
                    {/* Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                <WifiOff className="w-10 h-10 text-red-600" />
                            </div>
                            <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-100 animate-ping opacity-25" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal mb-4">
                        Digital Banking Portal Unavailable
                    </h1>

                    {/* Description */}
                    <p className="text-base text-charcoal-light mb-8 max-w-xl mx-auto">
                        We apologize for the inconvenience. Our digital banking services are currently undergoing scheduled maintenance.
                    </p>

                    {/* Status Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
                        <div className="flex items-start gap-3">
                            <WifiOff className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <div className="text-left flex-1">
                                <h3 className="font-semibold text-amber-900 mb-1 text-sm">System Maintenance in Progress</h3>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Our technical engineering team is actively performing scheduled upgrades.
                                    Transactions and access will resume shortly.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <button
                            onClick={checkServiceStatus}
                            disabled={isChecking}
                            className="inline-flex items-center justify-center h-12 px-6 text-sm font-semibold rounded-none bg-[color:var(--heritage-navy)] text-white hover:bg-[color:var(--heritage-navy-mid)] transition-all shadow-md disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                            {isChecking ? 'Checking...' : 'Check Status Again'}
                        </button>
                        <Link
                            href={ROUTES.home}
                            className="inline-flex items-center justify-center h-12 px-6 text-sm font-semibold rounded-none bg-transparent text-[color:var(--heritage-navy)] border-2 border-[color:var(--heritage-navy)] hover:bg-[color:var(--heritage-navy)] hover:text-white transition-all"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return to Homepage
                        </Link>
                    </div>

                    {/* Retry Count */}
                    {retryCount > 0 && (
                        <p className="text-xs text-gray-400 mb-6">
                            Auto-checked {retryCount} {retryCount === 1 ? 'time' : 'times'}
                        </p>
                    )}

                    {/* Alternative Options */}
                    <div className="border-t border-gray-100 pt-8">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                            Need Immediate Assistance?
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Phone className="w-5 h-5 text-[color:var(--heritage-navy)] mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-charcoal text-sm mb-0.5">24/7 Telephone Banking</h4>
                                    <a href={`tel:${BANK_INFO.phone}`} className="text-xs text-charcoal-light hover:text-[color:var(--heritage-navy)] transition-colors">
                                        {BANK_INFO.phone}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-[color:var(--heritage-navy)] mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-charcoal text-sm mb-0.5">Direct Client Support</h4>
                                    <a href={`mailto:${BANK_INFO.email}`} className="text-xs text-charcoal-light hover:text-[color:var(--heritage-navy)] transition-colors">
                                        {BANK_INFO.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
