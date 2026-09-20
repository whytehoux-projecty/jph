'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/commercial-ui/Button';
import { submitRegistrationForm } from '@/app/actions/registrationForm';

export default function RegistrationFormClient({ application }: { application: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        // 1. Full Personal Identification (KYC)
        fullLegalName: `${application.firstName} ${application.lastName}`,
        dateOfBirth: '',
        ssnItin: '',
        mothersMaidenName: '',

        // 2. Contact & Residential Details
        residentialAddress: '',
        mailingAddress: '',
        isMailingSame: true,
        primaryPhoneType: 'Mobile',

        // 3. Employment & Financial Profile
        employmentStatus: 'Employed',
        occupation: '',
        employerName: '',
        primarySourceOfFunds: 'Salary/Wages',
        estimatedAnnualIncome: '50000-100000',

        // 4. Identity Verification
        primaryIdType: 'Driver\'s License',
        idNumber: '',
        stateCountryOfIssuance: '',
        issueDate: '',
        expirationDate: '',
        idFrontDocumentUrl: '',
        idBackDocumentUrl: '',

        // 5. Account Configuration & Preferences
        overdraftProtection: false,
        debitCardRequest: true,
        nameToAppearOnCard: `${application.firstName} ${application.lastName}`,
        statementPreference: 'E-Statements',

        // 6. Initial Funding
        fundingMethod: 'External Bank Transfer (ACH)',
        externalAccountRoutingNumber: '',
        externalAccountNumber: '',
        initialDepositAmount: '',

        // 7. Legal Disclosures & E-Signatures
        w9Certification: false,
        electronicCommunicationsDisclosure: false,
        depositAccountAgreement: false,
        digitalSignature: '',
        signatureDate: new Date().toISOString().split('T')[0]
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

    const handleFileUpload = async (file: File, type: 'front' | 'back') => {
        // Mock upload for now
        updateField(type === 'front' ? 'idFrontDocumentUrl' : 'idBackDocumentUrl', `https://via.placeholder.com/400x250?text=ID+${type}`);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullLegalName) newErrors.fullLegalName = 'Required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
        if (!formData.ssnItin) newErrors.ssnItin = 'Required';
        if (!formData.mothersMaidenName) newErrors.mothersMaidenName = 'Required';

        if (!formData.residentialAddress) newErrors.residentialAddress = 'Required';
        if (!formData.isMailingSame && !formData.mailingAddress) newErrors.mailingAddress = 'Required';

        if (!formData.occupation) newErrors.occupation = 'Required';
        if (!formData.employerName) newErrors.employerName = 'Required';

        if (!formData.idNumber) newErrors.idNumber = 'Required';
        if (!formData.stateCountryOfIssuance) newErrors.stateCountryOfIssuance = 'Required';
        if (!formData.issueDate) newErrors.issueDate = 'Required';
        if (!formData.expirationDate) newErrors.expirationDate = 'Required';

        if (formData.fundingMethod === 'External Bank Transfer (ACH)') {
            if (!formData.externalAccountRoutingNumber) newErrors.externalAccountRoutingNumber = 'Required';
            if (!formData.externalAccountNumber) newErrors.externalAccountNumber = 'Required';
        }
        if (!formData.initialDepositAmount) newErrors.initialDepositAmount = 'Required';

        if (!formData.w9Certification) newErrors.w9Certification = 'Required';
        if (!formData.electronicCommunicationsDisclosure) newErrors.electronicCommunicationsDisclosure = 'Required';
        if (!formData.depositAccountAgreement) newErrors.depositAccountAgreement = 'Required';
        if (!formData.digitalSignature) newErrors.digitalSignature = 'Required';

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        try {
            const finalData = {
                ...formData,
                mailingAddress: formData.isMailingSame ? formData.residentialAddress : formData.mailingAddress,
                initialDepositAmount: Number(formData.initialDepositAmount)
            };
            
            await submitRegistrationForm(application.registrationToken, finalData);
            setSuccess(true);
        } catch (error) {
            console.error('Submission error:', error);
            setErrors({ submit: 'Failed to submit form. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-playfair font-bold text-charcoal">Registration Submitted Successfully</h2>
                <p className="text-charcoal-light">
                    Thank you. Your full registration details have been securely recorded. Our team will verify your documents and finalize your account setup shortly.
                </p>
                <div className="pt-4">
                    <Button onClick={() => router.push('/login')} variant="primary">Proceed to Login</Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            {errors.submit && (
                <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-center font-medium">
                    {errors.submit}
                </div>
            )}
            
            {/* 1. Full Personal Identification (KYC) */}
            <div className="p-8 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-heritage-navy text-white flex items-center justify-center text-xs">1</span>
                    Full Personal Identification (KYC)
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Full Legal Name (Must match ID)</label>
                        <input 
                            type="text" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.fullLegalName ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.fullLegalName}
                            onChange={(e) => updateField('fullLegalName', e.target.value)}
                        />
                        {errors.fullLegalName && <p className="text-xs text-red-500 mt-1">{errors.fullLegalName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Date of Birth (MM/DD/YYYY)</label>
                        <input 
                            type="date" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.dateOfBirth ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.dateOfBirth}
                            onChange={(e) => updateField('dateOfBirth', e.target.value)}
                        />
                        {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">SSN / ITIN</label>
                        <input 
                            type="password" 
                            placeholder="XXX-XX-XXXX"
                            className={`w-full px-3 py-2 border-b-2 ${errors.ssnItin ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.ssnItin}
                            onChange={(e) => updateField('ssnItin', e.target.value)}
                        />
                        {errors.ssnItin && <p className="text-xs text-red-500 mt-1">{errors.ssnItin}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Mother's Maiden Name (Security)</label>
                        <input 
                            type="password" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.mothersMaidenName ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.mothersMaidenName}
                            onChange={(e) => updateField('mothersMaidenName', e.target.value)}
                        />
                        {errors.mothersMaidenName && <p className="text-xs text-red-500 mt-1">{errors.mothersMaidenName}</p>}
                    </div>
                </div>
            </div>

            {/* 2. Contact & Residential Details */}
            <div className="p-8 border-b border-neutral-200 bg-neutral-50/50">
                <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-heritage-navy text-white flex items-center justify-center text-xs">2</span>
                    Contact & Residential Details
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Physical Residential Address (No P.O. Boxes)</label>
                        <input 
                            type="text" 
                            placeholder="Street, City, State, Zip Code"
                            className={`w-full px-3 py-2 border-b-2 ${errors.residentialAddress ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.residentialAddress}
                            onChange={(e) => updateField('residentialAddress', e.target.value)}
                        />
                        {errors.residentialAddress && <p className="text-xs text-red-500 mt-1">{errors.residentialAddress}</p>}
                    </div>
                    
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-neutral-300 text-heritage-navy focus:ring-heritage-navy"
                                checked={formData.isMailingSame}
                                onChange={(e) => updateField('isMailingSame', e.target.checked)}
                            />
                            <span className="text-sm font-medium text-charcoal">Mailing Address is same as Residential</span>
                        </label>
                        
                        {!formData.isMailingSame && (
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Mailing Address</label>
                                <input 
                                    type="text" 
                                    className={`w-full px-3 py-2 border-b-2 ${errors.mailingAddress ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                                    value={formData.mailingAddress}
                                    onChange={(e) => updateField('mailingAddress', e.target.value)}
                                />
                                {errors.mailingAddress && <p className="text-xs text-red-500 mt-1">{errors.mailingAddress}</p>}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Primary Phone Number Type</label>
                        <select 
                            className="w-full max-w-xs px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                            value={formData.primaryPhoneType}
                            onChange={(e) => updateField('primaryPhoneType', e.target.value)}
                        >
                            <option>Mobile</option>
                            <option>Home</option>
                            <option>Work</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. Employment & Financial Profile */}
            <div className="p-8 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-heritage-navy text-white flex items-center justify-center text-xs">3</span>
                    Employment & Financial Profile
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Employment Status</label>
                        <select 
                            className="w-full px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                            value={formData.employmentStatus}
                            onChange={(e) => updateField('employmentStatus', e.target.value)}
                        >
                            <option>Employed</option>
                            <option>Self-Employed</option>
                            <option>Unemployed</option>
                            <option>Retired</option>
                            <option>Student</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Occupation / Job Title</label>
                        <input 
                            type="text" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.occupation ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.occupation}
                            onChange={(e) => updateField('occupation', e.target.value)}
                        />
                        {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Employer Name</label>
                        <input 
                            type="text" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.employerName ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.employerName}
                            onChange={(e) => updateField('employerName', e.target.value)}
                        />
                        {errors.employerName && <p className="text-xs text-red-500 mt-1">{errors.employerName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Primary Source of Funds</label>
                        <select 
                            className="w-full px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                            value={formData.primarySourceOfFunds}
                            onChange={(e) => updateField('primarySourceOfFunds', e.target.value)}
                        >
                            <option>Salary/Wages</option>
                            <option>Investments</option>
                            <option>Inheritance</option>
                            <option>Savings</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Estimated Annual Income</label>
                        <select 
                            className="w-full px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                            value={formData.estimatedAnnualIncome}
                            onChange={(e) => updateField('estimatedAnnualIncome', e.target.value)}
                        >
                            <option value="0-50000">$0 - $50,000</option>
                            <option value="50000-100000">$50,000 - $100,000</option>
                            <option value="100000-250000">$100,000 - $250,000</option>
                            <option value="250000+">$250,000+</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4. Identity Verification */}
            <div className="p-8 border-b border-neutral-200 bg-neutral-50/50">
                <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-heritage-navy text-white flex items-center justify-center text-xs">4</span>
                    Identity Verification
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Primary ID Type</label>
                        <select 
                            className="w-full px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                            value={formData.primaryIdType}
                            onChange={(e) => updateField('primaryIdType', e.target.value)}
                        >
                            <option>Driver's License</option>
                            <option>State ID</option>
                            <option>Passport</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">ID Number</label>
                        <input 
                            type="text" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.idNumber ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.idNumber}
                            onChange={(e) => updateField('idNumber', e.target.value)}
                        />
                        {errors.idNumber && <p className="text-xs text-red-500 mt-1">{errors.idNumber}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">State/Country of Issuance</label>
                        <input 
                            type="text" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.stateCountryOfIssuance ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                            value={formData.stateCountryOfIssuance}
                            onChange={(e) => updateField('stateCountryOfIssuance', e.target.value)}
                        />
                        {errors.stateCountryOfIssuance && <p className="text-xs text-red-500 mt-1">{errors.stateCountryOfIssuance}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Issue Date</label>
                            <input 
                                type="date" 
                                className={`w-full px-3 py-2 border-b-2 ${errors.issueDate ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                                value={formData.issueDate}
                                onChange={(e) => updateField('issueDate', e.target.value)}
                            />
                            {errors.issueDate && <p className="text-xs text-red-500 mt-1">{errors.issueDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Exp Date</label>
                            <input 
                                type="date" 
                                className={`w-full px-3 py-2 border-b-2 ${errors.expirationDate ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors`}
                                value={formData.expirationDate}
                                onChange={(e) => updateField('expirationDate', e.target.value)}
                            />
                            {errors.expirationDate && <p className="text-xs text-red-500 mt-1">{errors.expirationDate}</p>}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className={`border-2 border-dashed p-6 text-center rounded-xl ${formData.idFrontDocumentUrl ? 'border-green-400 bg-green-50' : 'border-neutral-300 bg-white'}`}>
                        <h4 className="font-medium text-sm mb-2">ID Document (Front)</h4>
                        {formData.idFrontDocumentUrl ? (
                            <div className="text-green-600 text-sm font-medium">✓ Uploaded</div>
                        ) : (
                            <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 inline-block">
                                Select File
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'front')} />
                            </label>
                        )}
                    </div>
                    <div className={`border-2 border-dashed p-6 text-center rounded-xl ${formData.idBackDocumentUrl ? 'border-green-400 bg-green-50' : 'border-neutral-300 bg-white'}`}>
                        <h4 className="font-medium text-sm mb-2">ID Document (Back)</h4>
                        {formData.idBackDocumentUrl ? (
                            <div className="text-green-600 text-sm font-medium">✓ Uploaded</div>
                        ) : (
                            <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 inline-block">
                                Select File
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'back')} />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Account Configuration & Preferences */}
            <div className="p-8 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-heritage-navy text-white flex items-center justify-center text-xs">5</span>
                    Account Configuration & Preferences
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-neutral-300 text-heritage-navy focus:ring-heritage-navy"
                                checked={formData.overdraftProtection}
                                onChange={(e) => updateField('overdraftProtection', e.target.checked)}
                            />
                            <span className="text-sm font-medium text-charcoal">Opt-in to Overdraft Protection</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-neutral-300 text-heritage-navy focus:ring-heritage-navy"
                                checked={formData.debitCardRequest}
                                onChange={(e) => updateField('debitCardRequest', e.target.checked)}
                            />
                            <span className="text-sm font-medium text-charcoal">Request Debit Card</span>
                        </label>
                    </div>
                    <div className="space-y-4">
                        {formData.debitCardRequest && (
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Name to Appear on Card</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                                    value={formData.nameToAppearOnCard}
                                    onChange={(e) => updateField('nameToAppearOnCard', e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Statement Preference</label>
                            <select 
                                className="w-full px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                                value={formData.statementPreference}
                                onChange={(e) => updateField('statementPreference', e.target.value)}
                            >
                                <option>E-Statements</option>
                                <option>Paper Statements</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Initial Funding */}
            <div className="p-8 border-b border-neutral-200 bg-neutral-50/50">
                <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-heritage-navy text-white flex items-center justify-center text-xs">6</span>
                    Initial Funding
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Funding Method</label>
                        <select 
                            className="w-full px-3 py-2 border-b-2 border-neutral-300 focus:border-heritage-navy bg-transparent outline-none transition-colors"
                            value={formData.fundingMethod}
                            onChange={(e) => updateField('fundingMethod', e.target.value)}
                        >
                            <option>External Bank Transfer (ACH)</option>
                            <option>Wire Transfer</option>
                            <option>Mobile Check Deposit</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Initial Deposit Amount ($)</label>
                        <input 
                            type="number" 
                            placeholder="0.00"
                            className={`w-full px-3 py-2 border-b-2 ${errors.initialDepositAmount ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors font-mono`}
                            value={formData.initialDepositAmount}
                            onChange={(e) => updateField('initialDepositAmount', e.target.value)}
                        />
                        {errors.initialDepositAmount && <p className="text-xs text-red-500 mt-1">{errors.initialDepositAmount}</p>}
                    </div>

                    {formData.fundingMethod === 'External Bank Transfer (ACH)' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">External Routing Number</label>
                                <input 
                                    type="password" 
                                    className={`w-full px-3 py-2 border-b-2 ${errors.externalAccountRoutingNumber ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors font-mono`}
                                    value={formData.externalAccountRoutingNumber}
                                    onChange={(e) => updateField('externalAccountRoutingNumber', e.target.value)}
                                />
                                {errors.externalAccountRoutingNumber && <p className="text-xs text-red-500 mt-1">{errors.externalAccountRoutingNumber}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">External Account Number</label>
                                <input 
                                    type="password" 
                                    className={`w-full px-3 py-2 border-b-2 ${errors.externalAccountNumber ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors font-mono`}
                                    value={formData.externalAccountNumber}
                                    onChange={(e) => updateField('externalAccountNumber', e.target.value)}
                                />
                                {errors.externalAccountNumber && <p className="text-xs text-red-500 mt-1">{errors.externalAccountNumber}</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 7. Legal Disclosures & E-Signatures */}
            <div className="p-8">
                <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-heritage-navy text-white flex items-center justify-center text-xs">7</span>
                    Legal Disclosures & E-Signatures
                </h2>
                
                <div className="space-y-4 mb-8 bg-neutral-50 p-6 rounded-xl border border-neutral-200">
                    <label className="flex items-start gap-3">
                        <input 
                            type="checkbox" 
                            className={`mt-1 w-4 h-4 rounded ${errors.w9Certification ? 'border-red-500' : 'border-neutral-300'} text-heritage-navy focus:ring-heritage-navy`}
                            checked={formData.w9Certification}
                            onChange={(e) => updateField('w9Certification', e.target.checked)}
                        />
                        <div>
                            <span className="text-sm font-medium text-charcoal">W-9 Certification</span>
                            <p className="text-xs text-charcoal-light mt-0.5">Under penalties of perjury, I certify the SSN/ITIN provided is correct and I am not subject to backup withholding.</p>
                        </div>
                    </label>
                    <label className="flex items-start gap-3">
                        <input 
                            type="checkbox" 
                            className={`mt-1 w-4 h-4 rounded ${errors.electronicCommunicationsDisclosure ? 'border-red-500' : 'border-neutral-300'} text-heritage-navy focus:ring-heritage-navy`}
                            checked={formData.electronicCommunicationsDisclosure}
                            onChange={(e) => updateField('electronicCommunicationsDisclosure', e.target.checked)}
                        />
                        <div>
                            <span className="text-sm font-medium text-charcoal">Electronic Communications Disclosure</span>
                            <p className="text-xs text-charcoal-light mt-0.5">I agree to receive all account disclosures, notices, and statements electronically.</p>
                        </div>
                    </label>
                    <label className="flex items-start gap-3">
                        <input 
                            type="checkbox" 
                            className={`mt-1 w-4 h-4 rounded ${errors.depositAccountAgreement ? 'border-red-500' : 'border-neutral-300'} text-heritage-navy focus:ring-heritage-navy`}
                            checked={formData.depositAccountAgreement}
                            onChange={(e) => updateField('depositAccountAgreement', e.target.checked)}
                        />
                        <div>
                            <span className="text-sm font-medium text-charcoal">Deposit Account Agreement & Truth in Savings</span>
                            <p className="text-xs text-charcoal-light mt-0.5">I have read and agree to the terms governing my account.</p>
                        </div>
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-6 bg-yellow-50/50 p-6 rounded-xl border border-yellow-100">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Digital Signature (Type Full Legal Name)</label>
                        <input 
                            type="text" 
                            className={`w-full px-3 py-2 border-b-2 ${errors.digitalSignature ? 'border-red-500' : 'border-neutral-300 focus:border-heritage-navy'} bg-transparent outline-none transition-colors font-[cursive] text-lg`}
                            value={formData.digitalSignature}
                            onChange={(e) => updateField('digitalSignature', e.target.value)}
                        />
                        {errors.digitalSignature && <p className="text-xs text-red-500 mt-1">{errors.digitalSignature}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Date</label>
                        <input 
                            type="date" 
                            disabled
                            className="w-full px-3 py-2 border-b-2 border-neutral-200 bg-transparent text-neutral-500 outline-none"
                            value={formData.signatureDate}
                        />
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-neutral-200 flex justify-end">
                    <Button type="submit" variant="primary" size="large" className="w-full md:w-auto px-12" loading={isSubmitting}>
                        Submit Official Registration
                    </Button>
                </div>
            </div>
        </form>
    );
}
