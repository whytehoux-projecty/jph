'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { LedgerInput } from '@/components/commercial-ui/LedgerInput';
import { LedgerCheckbox } from '@/components/commercial-ui/LedgerCheckbox';
import { Lock, Mail, User, CreditCard, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { requestOnlineAccess } from '@/app/(corporate)/actions';
import { BRAND } from '@/src/content/facts';

export default function SignupPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        accountNumber: '',
        ssn: '',
        dateOfBirth: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        agreeToTerms: false,
        agreeToPrivacy: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [referenceId, setReferenceId] = useState('');

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.accountNumber) {
            newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{10,12}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = 'Account number must be 10-12 digits';
        }
        if (!formData.ssn) {
            newErrors.ssn = 'Last 4 digits of SSN are required';
        } else if (!/^\d{4}$/.test(formData.ssn)) {
            newErrors.ssn = 'Must be exactly 4 digits';
        }
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        }
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits';
        }
        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }
        if (!formData.agreeToPrivacy) {
            newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
        }
        return newErrors;
    };

    const handleNext = () => {
        let newErrors: Record<string, string> = {};
        if (currentStep === 1) newErrors = validateStep1();
        else if (currentStep === 2) newErrors = validateStep2();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setCurrentStep(currentStep + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validateStep3();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const res = await requestOnlineAccess({
                ...formData
                
            });
            setReferenceId(res.referenceId);
            setSuccess(true);
        } catch (error: any) {
            console.error('Registration failed:', error);
            setErrors({ submit: error.message || 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-paper-100 flex items-center justify-center p-6 py-24">
                <div className="max-w-xl w-full bg-paper-50 p-10 rounded border border-paper-200 text-center shadow-sm animate-fade-in-up">
                    <div className="w-16 h-16 bg-paper-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-pine-700" aria-hidden="true" />
                    </div>
                    <h1 className="font-display text-h2 text-ink-900 mb-4">Access Request Received</h1>
                    <div className="bg-paper-100 p-6 rounded border border-paper-200 mb-8 text-left">
                        <p className="label-mono text-ink-500 mb-1">Reference ID</p>
                        <p className="font-mono text-xl font-medium text-ink-900 mb-6">{referenceId}</p>
                        <p className="text-body-lg text-ink-700">
                            Your request for {BRAND.vault} digital access has been submitted securely. Our team will verify your information shortly. Once approved, you will receive an email containing a secure link to create your password.
                        </p>
                    </div>
                    <Button onClick={() => router.push('/')} variant="primary" className="w-full sm:w-auto">
                        Return to Homepage
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-paper-100 flex flex-col items-center justify-center p-6 py-24">
            <div className="w-full max-w-xl">
                <div className="text-center mb-10">
                    <ShieldCheck className="w-10 h-10 text-vermilion-600 mx-auto mb-4" aria-hidden="true" />
                    <h1 className="font-display text-display-sm text-ink-900 mb-3">Register for {BRAND.vault}</h1>
                    <p className="text-body text-ink-700">Set up digital access for your existing {BRAND.shortName} accounts.</p>
                </div>

                <div className="bg-paper-50 rounded border border-paper-200 p-8 shadow-sm">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-paper-200 -z-10" />
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-small transition-colors ${currentStep >= step ? 'bg-ink-900 text-paper-50' : 'bg-paper-100 text-ink-500 border border-paper-200'}`}
                            >
                                {step}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <h2 className="font-display text-h4 text-ink-900 mb-1">Account Verification</h2>
                                    <p className="text-small text-ink-500 mb-6">Enter your {BRAND.legalName} account details.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="accountNumber" className="block text-small font-medium text-ink-900">Account number</label>
                                    <input
                                        id="accountNumber"
                                        type="text"
                                        value={formData.accountNumber}
                                        onChange={(e) => updateField('accountNumber', e.target.value)}
                                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.accountNumber ? 'border-vermilion-600' : 'border-paper-300'}`}
                                    />
                                    {errors.accountNumber && <p className="text-xs text-vermilion-600">{errors.accountNumber}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="ssn" className="block text-small font-medium text-ink-900">Last 4 digits of SSN</label>
                                    <input
                                        id="ssn"
                                        type="password"
                                        maxLength={4}
                                        value={formData.ssn}
                                        onChange={(e) => updateField('ssn', e.target.value)}
                                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.ssn ? 'border-vermilion-600' : 'border-paper-300'}`}
                                    />
                                    {errors.ssn && <p className="text-xs text-vermilion-600">{errors.ssn}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="dateOfBirth" className="block text-small font-medium text-ink-900">Date of Birth</label>
                                    <input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.dateOfBirth ? 'border-vermilion-600' : 'border-paper-300'}`}
                                    />
                                    {errors.dateOfBirth && <p className="text-xs text-vermilion-600">{errors.dateOfBirth}</p>}
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleNext} variant="primary">
                                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <h2 className="font-display text-h4 text-ink-900 mb-1">Personal Profile</h2>
                                    <p className="text-small text-ink-500 mb-6">Enter your contact information.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="firstName" className="block text-small font-medium text-ink-900">First name</label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => updateField('firstName', e.target.value)}
                                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.firstName ? 'border-vermilion-600' : 'border-paper-300'}`}
                                        />
                                        {errors.firstName && <p className="text-xs text-vermilion-600">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="lastName" className="block text-small font-medium text-ink-900">Last name</label>
                                        <input
                                            id="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => updateField('lastName', e.target.value)}
                                            className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.lastName ? 'border-vermilion-600' : 'border-paper-300'}`}
                                        />
                                        {errors.lastName && <p className="text-xs text-vermilion-600">{errors.lastName}</p>}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-small font-medium text-ink-900">Email address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.email ? 'border-vermilion-600' : 'border-paper-300'}`}
                                    />
                                    {errors.email && <p className="text-xs text-vermilion-600">{errors.email}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="phone" className="block text-small font-medium text-ink-900">Phone number</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        className={`w-full h-12 rounded border bg-paper-50 px-3 text-body outline-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 transition-shadow ${errors.phone ? 'border-vermilion-600' : 'border-paper-300'}`}
                                    />
                                    {errors.phone && <p className="text-xs text-vermilion-600">{errors.phone}</p>}
                                </div>
                                <div className="pt-4 flex justify-between">
                                    <Button onClick={() => setCurrentStep(1)} variant="secondary">Back</Button>
                                    <Button onClick={handleNext} variant="primary">Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <h2 className="font-display text-h4 text-ink-900 mb-1">Agreements</h2>
                                    <p className="text-small text-ink-500 mb-6">Review terms and submit.</p>
                                </div>
                                
                                {errors.submit && (
                                    <div className="p-4 bg-vermilion-600/10 text-vermilion-700 text-small rounded border border-vermilion-600/20">
                                        {errors.submit}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.agreeToTerms}
                                            onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                                            className={`w-5 h-5 rounded mt-0.5 cursor-pointer ${errors.agreeToTerms ? 'border-vermilion-600 focus:ring-vermilion-600 text-vermilion-600' : 'border-paper-300 focus:ring-ink-900 text-ink-900'}`}
                                        />
                                        <div>
                                            <span className="text-small text-ink-700 group-hover:text-ink-900 transition-colors block">
                                                I have read and agree to the <Link href="/terms" target="_blank" className="text-ink-900 underline hover:text-vermilion-600">Terms of Service</Link> and Digital Banking Agreement.
                                            </span>
                                            {errors.agreeToTerms && <p className="text-xs text-vermilion-600 mt-1">{errors.agreeToTerms}</p>}
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.agreeToPrivacy}
                                            onChange={(e) => updateField('agreeToPrivacy', e.target.checked)}
                                            className={`w-5 h-5 rounded mt-0.5 cursor-pointer ${errors.agreeToPrivacy ? 'border-vermilion-600 focus:ring-vermilion-600 text-vermilion-600' : 'border-paper-300 focus:ring-ink-900 text-ink-900'}`}
                                        />
                                        <div>
                                            <span className="text-small text-ink-700 group-hover:text-ink-900 transition-colors block">
                                                I have read and agree to the <Link href="/privacy" target="_blank" className="text-ink-900 underline hover:text-vermilion-600">Privacy Policy</Link> and authorize the processing of my data.
                                            </span>
                                            {errors.agreeToPrivacy && <p className="text-xs text-vermilion-600 mt-1">{errors.agreeToPrivacy}</p>}
                                        </div>
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <Button onClick={() => setCurrentStep(2)} variant="secondary" disabled={isLoading}>Back</Button>
                                    <Button onClick={handleSubmit} variant="primary" disabled={isLoading}>
                                        {isLoading ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
}
