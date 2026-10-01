'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/commercial-ui/Button';
import { FileSearch, Search, ArrowRight, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { BRAND } from '@/src/content/facts';

export default function StatusPage() {
    const [formData, setFormData] = useState({
        email: '',
        referenceId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<'pending' | 'approved' | 'rejected' | 'not_found' | null>(null);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        setResult(null); // Reset result when typing
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        }
        if (!formData.referenceId) {
            newErrors.referenceId = 'Reference ID is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Mock result based on reference ID
            if (formData.referenceId.toUpperCase().includes('REJ')) {
                setResult('rejected');
            } else if (formData.referenceId.toUpperCase().includes('APP')) {
                setResult('approved');
            } else if (formData.referenceId.toUpperCase().includes('ERR')) {
                setResult('not_found');
            } else {
                setResult('pending');
            }
        }, 1000);
    };

    return (
        <main className="min-h-screen bg-paper-100 flex flex-col items-center justify-center p-6 py-24">
            <div className="w-full max-w-xl">
                <div className="text-center mb-10">
                    <FileSearch className="w-10 h-10 text-vermilion-600 mx-auto mb-4" aria-hidden="true" />
                    <h1 className="font-display text-display-sm text-ink-900 mb-3">Check Status</h1>
                    <p className="text-body text-ink-700">Track your {BRAND.shortName} application or request.</p>
                </div>

                <div className="bg-paper-50 rounded border border-paper-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-small font-medium text-ink-900">Email address</label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.email ? 'border-vermilion-600' : 'border-paper-300'}`}
                                placeholder="name@example.com"
                            />
                            {errors.email && <p className="text-xs text-vermilion-600">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="referenceId" className="block text-small font-medium text-ink-900">Reference ID</label>
                            <input
                                id="referenceId"
                                type="text"
                                value={formData.referenceId}
                                onChange={(e) => updateField('referenceId', e.target.value)}
                                className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none uppercase focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.referenceId ? 'border-vermilion-600' : 'border-paper-300'}`}
                                placeholder={`${BRAND.shortName.substring(0,3).toUpperCase()}-123456`}
                            />
                            {errors.referenceId && <p className="text-xs text-vermilion-600">{errors.referenceId}</p>}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" variant="primary" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? 'Checking...' : 'Check Status'}
                                {!isLoading && <Search className="w-4 h-4 ml-2" aria-hidden="true" />}
                            </Button>
                        </div>
                    </form>

                    {/* Results Area */}
                    {result && (
                        <div className="mt-8 pt-8 border-t border-paper-200 animate-fade-in-up">
                            {result === 'not_found' && (
                                <div className="p-6 bg-paper-100 rounded border border-paper-200 text-center">
                                    <ShieldAlert className="w-8 h-8 text-ink-500 mx-auto mb-3" aria-hidden="true" />
                                    <h3 className="font-display text-h4 text-ink-900 mb-1">Record Not Found</h3>
                                    <p className="text-small text-ink-700">We couldn't find an application matching that email and Reference ID. Please check your details and try again.</p>
                                </div>
                            )}

                            {result === 'pending' && (
                                <div className="p-6 bg-paper-100 rounded border border-paper-200 text-center">
                                    <Clock className="w-8 h-8 text-vermilion-600 mx-auto mb-3" aria-hidden="true" />
                                    <h3 className="font-display text-h4 text-ink-900 mb-1">Under Review</h3>
                                    <p className="text-small text-ink-700 mb-4">Your application is currently being reviewed by our onboarding team. This typically takes 1-2 business days.</p>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full h-1.5 bg-paper-200 rounded-full overflow-hidden">
                                            <div className="w-1/2 h-full bg-vermilion-600 rounded-full" />
                                        </div>
                                        <span className="text-xs font-mono text-ink-500 uppercase tracking-widest">Step 2 of 3</span>
                                    </div>
                                </div>
                            )}

                            {result === 'approved' && (
                                <div className="p-6 bg-[#E6F3EC] rounded border border-[#B3E0C9] text-center">
                                    <CheckCircle className="w-8 h-8 text-pine-700 mx-auto mb-3" aria-hidden="true" />
                                    <h3 className="font-display text-h4 text-ink-900 mb-1">Action Required</h3>
                                    <p className="text-small text-ink-700 mb-4">Your preliminary application was approved. Please check your email for a secure link to complete registration.</p>
                                    <Button as="a" href="/contact" variant="secondary" className="w-full sm:w-auto">
                                        I didn't receive the email
                                    </Button>
                                </div>
                            )}

                            {result === 'rejected' && (
                                <div className="p-6 bg-paper-100 rounded border border-paper-200 text-center">
                                    <ShieldAlert className="w-8 h-8 text-ink-500 mx-auto mb-3" aria-hidden="true" />
                                    <h3 className="font-display text-h4 text-ink-900 mb-1">Update on Application</h3>
                                    <p className="text-small text-ink-700 mb-4">We are unable to approve your application at this time based on the information provided. An official notice has been sent to your email.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <Link href="/contact" className="text-small text-ink-500 hover:text-ink-900 transition-colors underline underline-offset-2">
                        Need help with your application?
                    </Link>
                </div>
            </div>
        </main>
    );
}
