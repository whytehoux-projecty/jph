'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { Input } from '@/components/forms/Input';
import { Card, CardContent } from '@/components/commercial-ui/Card';
import { CheckCircle, Briefcase, User, DollarSign, Shield, Camera, Upload } from 'lucide-react';
import { requestAccountOpening } from '@/app/(corporate)/actions';

const steps = [
    { title: 'Pre-qualify', icon: Briefcase },
    { title: 'Personal', icon: User },
    { title: 'Financial', icon: DollarSign },
    { title: 'Identity', icon: Camera },
    { title: 'Review', icon: Shield },
];

export default function ApplicationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // Upload states
    const [uploadingId, setUploadingId] = useState(false);
    const [uploadingSelfie, setUploadingSelfie] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        applicationType: 'PERSONAL',
        nationality: '',
        dateOfBirth: '',
        currencyPreference: 'USD',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        employmentStatus: '',
        annualIncome: '',
        sourceOfFunds: '',
        idDocumentUrl: '',
        livenessImageUrl: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFileUpload = async (file: File, type: 'id' | 'selfie') => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        
        type === 'id' ? setUploadingId(true) : setUploadingSelfie(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                updateField(type === 'id' ? 'idDocumentUrl' : 'livenessImageUrl', data.url);
            } else {
                setErrors(prev => ({ ...prev, [type]: data.message || 'Upload failed' }));
            }
        } catch (e) {
            setErrors(prev => ({ ...prev, [type]: 'Failed to connect to upload server' }));
        } finally {
            type === 'id' ? setUploadingId(false) : setUploadingSelfie(false);
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 0:
                if (!formData.applicationType) newErrors.applicationType = 'Required';
                if (!formData.nationality) newErrors.nationality = 'Required';
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
                else {
                    const age = (new Date().getTime() - new Date(formData.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                    if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old to apply.';
                }
                if (!formData.currencyPreference) newErrors.currencyPreference = 'Required';
                break;
            case 1:
                if (!formData.firstName) newErrors.firstName = 'First name is required';
                if (!formData.lastName) newErrors.lastName = 'Last name is required';
                if (!formData.email) newErrors.email = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
                if (!formData.phone) newErrors.phone = 'Phone is required';
                if (!formData.address) newErrors.address = 'Address is required';
                if (!formData.city) newErrors.city = 'City is required';
                if (!formData.state) newErrors.state = 'State is required';
                if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
                break;
            case 2:
                if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
                if (!formData.annualIncome) newErrors.annualIncome = 'Annual income is required';
                if (!formData.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required';
                break;
            case 3:
                if (!formData.idDocumentUrl) newErrors.idDocumentUrl = 'ID Document upload is required';
                if (!formData.livenessImageUrl) newErrors.livenessImageUrl = 'Selfie upload is required';
                break;
        }

        return newErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await requestAccountOpening({
                ...formData,
                annualIncome: Number(formData.annualIncome)
            });
            setSuccess(true);
        } catch (error) {
            console.error('Application error:', error);
            setErrors({
                submit: 'Failed to submit application. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-off-white py-20 px-4">
                <div className="container mx-auto max-w-2xl">
                    <Card className="text-center p-12 shadow-vintage-lg border-none bg-white">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-playfair font-bold text-charcoal mb-4">Application Received</h1>
                        <p className="text-charcoal-light mb-8 text-lg">
                            Thank you for choosing JP Heritage Bank. Your application has been successfully submitted and is under review by our team. You will receive an email update within 24-48 hours.
                        </p>
                        <Button onClick={() => router.push('/')} variant="primary" size="large">
                            Return Home
                        </Button>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-off-white py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-playfair font-bold text-charcoal mb-4">Open an Account</h1>
                    <p className="text-charcoal-light">Secure, global banking tailored to you</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto px-4 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center z-10 bg-off-white px-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${index <= currentStep ? 'bg-heritage-navy text-white shadow-md' : 'bg-gray-200 text-gray-400'
                                }`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] sm:text-xs mt-2 font-medium ${index <= currentStep ? 'text-charcoal' : 'text-gray-400'
                                }`}>{step.title}</span>
                        </div>
                    ))}
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 -z-10 hidden sm:block">
                        <div 
                            className="h-full bg-heritage-navy transition-all duration-300" 
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} 
                        />
                    </div>
                </div>

                <Card className="shadow-vintage-xl border-white/20">
                    <CardContent className="p-8">
                        {errors.submit && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg">
                                {errors.submit}
                            </div>
                        )}

                        {/* Step 0: Pre-qualification */}
                        {currentStep === 0 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Pre-qualification</h2>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-charcoal">Account Type</label>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {['PERSONAL', 'BUSINESS', 'WEALTH'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => updateField('applicationType', type)}
                                                    className={`p-4 rounded border-2 text-left transition-all ${formData.applicationType === type
                                                        ? 'border-heritage-navy bg-heritage-navy/5 ring-1 ring-heritage-navy'
                                                        : 'border-faded-gray hover:border-heritage-navy/50 bg-white'
                                                        }`}
                                                >
                                                    <div className="font-semibold text-sm text-charcoal">{type === 'WEALTH' ? 'Wealth' : type.charAt(0) + type.slice(1).toLowerCase()}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-charcoal">Nationality / Residency</label>
                                            <select
                                                className="w-full h-12 rounded-lg border border-faded-gray px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy"
                                                value={formData.nationality}
                                                onChange={(e) => updateField('nationality', e.target.value)}
                                            >
                                                <option value="">Select Country</option>
                                                <option value="US">United States</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="EU">European Union</option>
                                                <option value="OTHER">Other Global</option>
                                            </select>
                                            {errors.nationality && <p className="text-xs text-red-500">{errors.nationality}</p>}
                                        </div>
                                        <Input
                                            label="Date of Birth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => updateField('dateOfBirth', e.target.value)}
                                            error={errors.dateOfBirth}
                                        />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-charcoal">Primary Currency Preference</label>
                                            <select
                                                className="w-full h-12 rounded-lg border border-faded-gray px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy"
                                                value={formData.currencyPreference}
                                                onChange={(e) => updateField('currencyPreference', e.target.value)}
                                            >
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="GBP">GBP - British Pound</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Personal & Contact */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Personal & Contact Details</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="First Name"
                                        value={formData.firstName}
                                        onChange={(e) => updateField('firstName', e.target.value)}
                                        error={errors.firstName}
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
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        error={errors.phone}
                                    />
                                    <div className="col-span-2">
                                        <Input
                                            label="Street Address"
                                            value={formData.address}
                                            onChange={(e) => updateField('address', e.target.value)}
                                            error={errors.address}
                                        />
                                    </div>
                                    <Input
                                        label="City"
                                        value={formData.city}
                                        onChange={(e) => updateField('city', e.target.value)}
                                        error={errors.city}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="State/Province"
                                            value={formData.state}
                                            onChange={(e) => updateField('state', e.target.value)}
                                            error={errors.state}
                                        />
                                        <Input
                                            label="Postal Code"
                                            value={formData.zipCode}
                                            onChange={(e) => updateField('zipCode', e.target.value)}
                                            error={errors.zipCode}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Financial Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Financial Profile</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-charcoal">Employment Status</label>
                                        <select
                                            className="w-full h-12 rounded-lg border border-faded-gray px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy"
                                            value={formData.employmentStatus}
                                            onChange={(e) => updateField('employmentStatus', e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="EMPLOYED">Employed</option>
                                            <option value="SELF_EMPLOYED">Self Employed</option>
                                            <option value="RETIRED">Retired</option>
                                            <option value="STUDENT">Student</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        {errors.employmentStatus && <p className="text-xs text-red-500">{errors.employmentStatus}</p>}
                                    </div>

                                    <Input
                                        label="Annual Income (USD equivalent)"
                                        type="number"
                                        value={formData.annualIncome}
                                        onChange={(e) => updateField('annualIncome', e.target.value)}
                                        error={errors.annualIncome}
                                        icon={<DollarSign className="w-4 h-4" />}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-charcoal">Primary Source of Funds</label>
                                        <select
                                            className="w-full h-12 rounded-lg border border-faded-gray px-4 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-navy"
                                            value={formData.sourceOfFunds}
                                            onChange={(e) => updateField('sourceOfFunds', e.target.value)}
                                        >
                                            <option value="">Select Source</option>
                                            <option value="SALARY">Salary / Wages</option>
                                            <option value="BUSINESS">Business Income</option>
                                            <option value="INVESTMENTS">Investments</option>
                                            <option value="INHERITANCE">Inheritance</option>
                                            <option value="SAVINGS">Savings</option>
                                        </select>
                                        {errors.sourceOfFunds && <p className="text-xs text-red-500">{errors.sourceOfFunds}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Step 3: Identity Capture */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Digital Identity Verification</h2>
                                <p className="text-sm text-charcoal-light">To comply with global KYC regulations, we need to verify your identity.</p>
                                
                                <div className="space-y-6">
                                    {/* ID Document Upload */}
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center ${formData.idDocumentUrl ? 'border-green-500 bg-green-50' : 'border-faded-gray bg-neutral-50'}`}>
                                        <Upload className={`w-8 h-8 mx-auto mb-3 ${formData.idDocumentUrl ? 'text-green-600' : 'text-gray-400'}`} />
                                        <h3 className="font-semibold mb-1">Government Issued ID</h3>
                                        <p className="text-xs text-gray-500 mb-4">Passport, National ID, or Driver's License</p>
                                        
                                        {formData.idDocumentUrl ? (
                                            <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" /> Document Uploaded
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 inline-block transition-colors">
                                                {uploadingId ? 'Uploading...' : 'Select File'}
                                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'id')} disabled={uploadingId} />
                                            </label>
                                        )}
                                        {errors.idDocumentUrl && <p className="text-xs text-red-500 mt-2">{errors.idDocumentUrl}</p>}
                                    </div>

                                    {/* Selfie Upload */}
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center ${formData.livenessImageUrl ? 'border-green-500 bg-green-50' : 'border-faded-gray bg-neutral-50'}`}>
                                        <Camera className={`w-8 h-8 mx-auto mb-3 ${formData.livenessImageUrl ? 'text-green-600' : 'text-gray-400'}`} />
                                        <h3 className="font-semibold mb-1">Liveness Selfie Check</h3>
                                        <p className="text-xs text-gray-500 mb-4">A clear photo of your face to match your ID</p>
                                        
                                        {formData.livenessImageUrl ? (
                                            <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" /> Selfie Uploaded
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 inline-block transition-colors">
                                                {uploadingSelfie ? 'Uploading...' : 'Take/Select Photo'}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'selfie')} disabled={uploadingSelfie} />
                                            </label>
                                        )}
                                        {errors.livenessImageUrl && <p className="text-xs text-red-500 mt-2">{errors.livenessImageUrl}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                <h2 className="text-2xl font-playfair font-semibold text-charcoal">Review Application</h2>
                                <div className="bg-gray-50 rounded-lg p-6 space-y-4 text-sm border border-gray-100">
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Account Type</span>
                                        <span className="font-semibold text-right">{formData.applicationType} ({formData.currencyPreference})</span>
                                    </div>
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Applicant</span>
                                        <span className="font-semibold text-right">{formData.firstName} {formData.lastName}<br/><span className="text-xs font-normal text-gray-500">{formData.nationality}</span></span>
                                    </div>
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Contact</span>
                                        <span className="font-semibold text-right">{formData.email}<br/>{formData.phone}</span>
                                    </div>
                                    <div className="grid grid-cols-2 pb-4 border-b border-gray-200">
                                        <span className="text-gray-500">Documents</span>
                                        <span className="font-semibold text-right text-green-600 flex items-center justify-end gap-1">
                                            <CheckCircle className="w-3 h-3" /> Verified
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-gray-500">Annual Income</span>
                                        <span className="font-semibold text-right">${Number(formData.annualIncome).toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    By clicking Submit, you certify that the information provided is true and accurate. You consent to background KYC checks.
                                </p>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 0 || isSubmitting}
                                className={currentStep === 0 ? 'invisible' : ''}
                            >
                                Back
                            </Button>
                            <Button
                                variant="primary"
                                onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                                loading={isSubmitting}
                                disabled={uploadingId || uploadingSelfie}
                            >
                                {currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
