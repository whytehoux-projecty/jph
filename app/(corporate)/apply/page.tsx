'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { Input } from '@/components/forms/Input';
import { Card, CardContent } from '@/components/commercial-ui/Card';
import { CheckCircle, Shield, Briefcase, Mail, Phone, MapPin, User, Building2, Clock, ShieldCheck, X } from 'lucide-react';
import { requestAccountOpening } from '@/app/(corporate)/actions';

function ApplicationFormContent() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchParams = useSearchParams();
    const isSubmitted = searchParams.get('submitted') === 'true';
    const [referenceId] = useState(() => `JPH-${Math.floor(100000 + Math.random() * 900000)}`);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        applicationType: 'PERSONAL',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zipCode: '',
        desiredAccountType: '',
        isExistingCustomer: false,
        isUsCitizenOrResident: false,
        consentComms: false,
        consentPrivacy: false,
    });

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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.zipCode) newErrors.zipCode = 'Zip/Postal code is required';
        
        if (!formData.desiredAccountType) newErrors.desiredAccountType = 'Account type is required';
        
        if (!formData.consentComms) newErrors.consentComms = 'You must consent to communications';
        if (!formData.consentPrivacy) newErrors.consentPrivacy = 'You must acknowledge the privacy policy';

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await requestAccountOpening(formData);
            // Reload page with submitted query parameter to display official acknowledgment on same page
            window.location.href = '/apply?submitted=true';
        } catch (error) {
            console.error('Application error:', error);
            setErrors({
                submit: 'Failed to submit request. Please try again.'
            });
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-off-white flex">
            {/* Left Sidebar - Brand & Info */}
            <div className="hidden lg:flex w-1/3 bg-heritage-navy text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-vintage-gold/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-vintage-gold/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
                
                <div className="relative z-10 space-y-8">
                    <div>
                        <Shield className="w-12 h-12 text-vintage-gold mb-6" />
                        <h1 className="text-4xl font-playfair font-bold mb-4">Begin Your Journey</h1>
                        <p className="text-blue-100/80 leading-relaxed text-lg">
                            Apply for a JP Heritage Bank account in minutes. We provide secure, global banking tailored to your unique financial needs.
                        </p>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-white/10">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-vintage-gold">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Request Application</h3>
                                <p className="text-blue-100/70 text-sm">Fill out this quick form to determine preliminary eligibility.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-vintage-gold">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Bank Approval</h3>
                                <p className="text-blue-100/70 text-sm">Our team will review your request and approve qualified applicants.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <span className="font-semibold text-vintage-gold">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Full Registration</h3>
                                <p className="text-blue-100/70 text-sm">Complete our secure KYC process and fund your new account.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative z-10 text-sm text-blue-100/50">
                    &copy; {new Date().getFullYear()} JP Heritage Bank. Member FDIC.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="lg:hidden mb-8 text-center">
                        <Shield className="w-10 h-10 text-heritage-navy mx-auto mb-4" />
                        <h1 className="text-3xl font-playfair font-bold text-charcoal">Open an Account</h1>
                        <p className="text-charcoal-light mt-2">Secure, global banking tailored to you</p>
                    </div>

                    {/* Professional Institutional Notification when submitted */}
                    {isSubmitted && (
                        <div className="mb-10 bg-white border border-vintage-gold/50 rounded-2xl shadow-vintage-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                            {/* Top Gold & Navy Accent Bar */}
                            <div className="bg-gradient-to-r from-heritage-navy via-heritage-navy-light to-heritage-navy px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white border-b border-vintage-gold/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-vintage-gold/20 flex items-center justify-center text-vintage-gold border border-vintage-gold/40">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-playfair font-bold text-base md:text-lg tracking-wide text-white">
                                            Application Request Submitted
                                        </h3>
                                        <p className="text-xs text-blue-200/80">Official Notice • JP Heritage Underwriting & Admissions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Request Successfully Recorded
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.delete('submitted');
                                            window.history.replaceState({}, '', url.toString());
                                            window.location.reload();
                                        }}
                                        className="text-white/60 hover:text-white p-1 transition-colors"
                                        title="Dismiss notice"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">
                                {/* Reference Details Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-off-white rounded-xl border border-neutral-200/80 text-xs">
                                    <div>
                                        <span className="text-charcoal-light block mb-0.5">Reference ID</span>
                                        <span className="font-mono font-bold text-heritage-navy text-sm">{referenceId}</span>
                                    </div>
                                    <div>
                                        <span className="text-charcoal-light block mb-0.5">Review Status</span>
                                        <span className="font-semibold text-amber-700 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> Under Review
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-charcoal-light block mb-0.5">Submission Date</span>
                                        <span className="font-medium text-charcoal">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div>
                                        <span className="text-charcoal-light block mb-0.5">Admissions Division</span>
                                        <span className="font-medium text-charcoal">Private Client CIP</span>
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div className="space-y-2">
                                    <h4 className="text-base font-semibold text-charcoal">
                                        Thank you for initiating your account opening inquiry with JP Heritage Bank.
                                    </h4>
                                    <p className="text-sm text-charcoal-light leading-relaxed">
                                        Your preliminary eligibility dossier has been securely recorded and dispatched to our Underwriting & Admissions Committee. You do not need to resubmit this form.
                                    </p>
                                </div>

                                {/* Step Process Indicator */}
                                <div className="border-t border-neutral-200/80 pt-5">
                                    <h5 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-4">
                                        Next Steps in Your Onboarding Protocol:
                                    </h5>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70">
                                            <div className="flex items-center gap-2 mb-1.5 text-emerald-800 font-semibold text-xs">
                                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                <span>1. Request Received</span>
                                            </div>
                                            <p className="text-xs text-emerald-900/80">
                                                Your preliminary information has been logged and encrypted.
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/70">
                                            <div className="flex items-center gap-2 mb-1.5 text-blue-800 font-semibold text-xs">
                                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                                                <span>2. Underwriter Review</span>
                                            </div>
                                            <p className="text-xs text-blue-900/80">
                                                Admissions officers review regional and identity qualifications (1–2 business days).
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
                                            <div className="flex items-center gap-2 mb-1.5 text-charcoal font-semibold text-xs">
                                                <span className="w-4 h-4 rounded-full bg-neutral-300 text-charcoal flex items-center justify-center text-[10px]">3</span>
                                                <span>3. Secure KYC Link</span>
                                            </div>
                                            <p className="text-xs text-charcoal-light">
                                                Upon approval, a single-use tokenized link is emailed to complete your official KYC application.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Concierge Help */}
                                <div className="bg-heritage-navy/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-charcoal-light border border-heritage-navy/10">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-heritage-navy shrink-0" />
                                        <span>For expedited corporate or institutional inquiries: <strong>admissions@jpheritage.com</strong></span>
                                    </div>
                                    <span className="font-mono text-heritage-navy font-semibold shrink-0">(800) 555-JPHB</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {errors.submit && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
                                {errors.submit}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h2 className="text-xl font-semibold text-charcoal">Personal Information</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <Input
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => updateField('firstName', e.target.value)}
                                    error={errors.firstName}
                                    icon={<User className="w-4 h-4" />}
                                />
                                <Input
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => updateField('lastName', e.target.value)}
                                    error={errors.lastName}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    error={errors.email}
                                    icon={<Mail className="w-4 h-4" />}
                                />
                                <Input
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    error={errors.phone}
                                    icon={<Phone className="w-4 h-4" />}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Zip/Postal Code"
                                        value={formData.zipCode}
                                        onChange={(e) => updateField('zipCode', e.target.value)}
                                        error={errors.zipCode}
                                        icon={<MapPin className="w-4 h-4" />}
                                        helperText="Used to verify regional eligibility"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h2 className="text-xl font-semibold text-charcoal">Account Preferences & Eligibility</h2>
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-charcoal">Desired Account Type</label>
                                    <select
                                        className="w-full h-12 rounded-lg border border-gray-300 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy/50 transition-shadow"
                                        value={formData.desiredAccountType}
                                        onChange={(e) => updateField('desiredAccountType', e.target.value)}
                                    >
                                        <option value="">Select Account Type</option>
                                        <option value="Everyday Checking">Everyday Checking</option>
                                        <option value="High-Yield Savings">High-Yield Savings</option>
                                        <option value="Certificate of Deposit">Certificate of Deposit</option>
                                    </select>
                                    {errors.desiredAccountType && <p className="text-xs text-red-500 mt-1">{errors.desiredAccountType}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-3 p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                                        <label className="text-sm font-medium text-charcoal block">Are you an existing customer?</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.isExistingCustomer ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {formData.isExistingCustomer && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={formData.isExistingCustomer} onChange={() => updateField('isExistingCustomer', true)} />
                                                <span className="text-sm">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!formData.isExistingCustomer ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {!formData.isExistingCustomer && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={!formData.isExistingCustomer} onChange={() => updateField('isExistingCustomer', false)} />
                                                <span className="text-sm">No</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                                        <label className="text-sm font-medium text-charcoal block">Are you a U.S. Citizen or Resident Alien?</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.isUsCitizenOrResident ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {formData.isUsCitizenOrResident && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={formData.isUsCitizenOrResident} onChange={() => updateField('isUsCitizenOrResident', true)} />
                                                <span className="text-sm">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!formData.isUsCitizenOrResident ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                                    {!formData.isUsCitizenOrResident && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={!formData.isUsCitizenOrResident} onChange={() => updateField('isUsCitizenOrResident', false)} />
                                                <span className="text-sm">No</span>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Used for basic KYC routing</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h2 className="text-xl font-semibold text-charcoal">Consent</h2>
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="pt-0.5">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.consentComms ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                            {formData.consentComms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.consentComms} onChange={(e) => updateField('consentComms', e.target.checked)} />
                                    <div>
                                        <span className="text-sm text-charcoal leading-tight">I consent to receive email and SMS communications regarding my application.</span>
                                        {errors.consentComms && <p className="text-xs text-red-500 mt-1">{errors.consentComms}</p>}
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="pt-0.5">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.consentPrivacy ? 'border-heritage-navy bg-heritage-navy' : 'border-gray-300 group-hover:border-heritage-navy/50'}`}>
                                            {formData.consentPrivacy && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.consentPrivacy} onChange={(e) => updateField('consentPrivacy', e.target.checked)} />
                                    <div>
                                        <span className="text-sm text-charcoal leading-tight">I acknowledge the preliminary Privacy Policy and Terms of Use.</span>
                                        {errors.consentPrivacy && <p className="text-xs text-red-500 mt-1">{errors.consentPrivacy}</p>}
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-14 text-lg"
                                loading={isSubmitting}
                            >
                                Submit Request
                            </Button>
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Your information is secured with bank-level encryption.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default function ApplicationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-off-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-heritage-navy border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ApplicationFormContent />
        </Suspense>
    );
}
