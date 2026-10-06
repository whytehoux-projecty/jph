'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Camera,
    Upload,
    CheckCircle2,
    FileText,
    RefreshCw,
    Trash2,
    Lock, X, UserCheck, Download
} from 'lucide-react';
import { submitRegistrationForm } from '@/app/actions/registrationForm';
import { registrationSchema } from '@/lib/registration/schema';

export default function BusinessRegistrationFormClient({ application }: { application: any }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Signature state & refs
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [downloadTimestamp, setDownloadTimestamp] = useState<string | null>(null);

    const handleDownloadPdf = () => {
        setDownloadTimestamp(new Date().toLocaleString('en-US', { timeZoneName: 'short' }));
        setTimeout(() => {
            window.print();
        }, 150);
    };
    const [signatureFileName, setSignatureFileName] = useState<string | null>(null);
    const [signatureFileType, setSignatureFileType] = useState<'image' | 'pdf' | null>(null);

    // Passport photo state
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Live camera modal state (for signature and photo)
    const [activeCameraTarget, setActiveCameraTarget] = useState<'signature' | 'photo' | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Hidden input refs
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const photoInputRef = useRef<HTMLInputElement | null>(null);
    const idFrontInputRef = useRef<HTMLInputElement | null>(null);
    const idBackInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState({
        // Title & Name
        title: 'Mr',
        gender: 'Male',
        fullLegalName: `${application.firstName} ${application.lastName}`,
        dateOfBirth: '',
        ssnItin: '',
        nationality: 'United States',
        countryOfResidence: 'United States',

        // 2. Contact & Residential Details
        residentialAddress: '',
        mailingAddress: '',
        isMailingSame: true,
        primaryPhoneType: 'Mobile',
        secondaryPhone: '',

        // 3. Employment & Financial Profile
        employmentStatus: 'Employed',
        occupation: '',
        employerName: '',
        employerAddress: '',
        primarySourceOfFunds: 'Salary/Wages',
        estimatedAnnualIncome: '50000-100000',

        // 4. Identity Verification
        passportPhotoUrl: '',
        primaryIdType: "Driver's License",
        idNumber: '',
        stateCountryOfIssuance: '',
        issueDate: '',
        expirationDate: '',
        idFrontDocumentUrl: '',
        idBackDocumentUrl: '',



        // 6. Account Configuration & Preferences
        desiredAccountType: application.desiredAccountType || 'Everyday Checking',
        currencyPreference: application.currencyPreference || 'USD',
        overdraftProtection: false,
        debitCardRequest: true,
        nameToAppearOnCard: `${application.firstName} ${application.lastName}`,
        statementPreference: 'E-Statements',

        // 7. Initial Funding
        fundingMethod: 'External Bank Transfer (ACH)',
        externalAccountRoutingNumber: '',
        externalAccountNumber: '',
        initialDepositAmount: '',
        
        // CDD & Business
        businessName: '',
        dbaName: '',
        ein: '',
        stateOfFormation: '',
        yearOfFormation: '',
        industry: '',
        website: '',
        entityType: '',
        businessRegistrationNo: '',
        uboDeclaration: '',
        purposeOfAccount: '',
        expectedMonthlyVolume: '',

        // Compliance & PoA
        poaWaiverRequested: false,
        proofOfAddressType: 'Utility Bill',
        proofOfAddressUrl: '',
        isUsTaxPerson: true,
        w8benCertification: false,
        foreignTaxResidencies: '',
        isPep: false,
        pepDetails: '',
        sanctionsDeclaration: false,

        // 8. Legal Disclosures & E-Signatures
        w9Certification: false,
        electronicCommunicationsDisclosure: false,
        depositAccountAgreement: false,
        marketingConsent: true,
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

    // Auto-save drafts
    useEffect(() => {
        const saved = localStorage.getItem(`business_registration_${application.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse saved registration draft');
            }
        }
    }, [application.id]);

    useEffect(() => {
        const safeData = { ...formData };
        // Delete sensitive data from local cache
        delete (safeData as any).ssnItin;
        delete (safeData as any).idNumber;
        delete (safeData as any).ein;
        delete (safeData as any).digitalSignature;
        delete (safeData as any).passportPhotoUrl;
        delete (safeData as any).idFrontDocumentUrl;
        delete (safeData as any).idBackDocumentUrl;
        
        localStorage.setItem(`business_registration_${application.id}`, JSON.stringify(safeData));
    }, [formData, application.id]);

    // ID document upload
    const handleIdUpload = (file: File, type: 'front' | 'back') => {
        const reader = new FileReader();
        reader.onload = () => {
            updateField(type === 'front' ? 'idFrontDocumentUrl' : 'idBackDocumentUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Photo upload
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setPhotoPreview(dataUrl);
            updateField('passportPhotoUrl', dataUrl);
        };
        reader.readAsDataURL(file);
    };

    // Camera handling
    const openCamera = async (target: 'signature' | 'photo') => {
        setActiveCameraTarget(target);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: target === 'photo' ? 'user' : 'environment' }
                });
                setCameraStream(stream);
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                }, 150);
                return;
            } catch (err) {
                console.warn('getUserMedia failed, falling back to file input camera capture:', err);
            }
        }
        if (target === 'signature') {
            cameraInputRef.current?.click();
        } else {
            photoInputRef.current?.click();
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setActiveCameraTarget(null);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && activeCameraTarget) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                if (activeCameraTarget === 'signature') {
                    setSignaturePreview(dataUrl);
                    setSignatureFileType('image');
                    setSignatureFileName(`signature_snap_${Date.now()}.png`);
                    updateField('digitalSignature', dataUrl);
                } else {
                    setPhotoPreview(dataUrl);
                    updateField('passportPhotoUrl', dataUrl);
                }
                stopCamera();
            }
        }
    };

    const handleCameraFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setSignaturePreview(result);
            setSignatureFileType('image');
            setSignatureFileName(file.name);
            updateField('digitalSignature', result);
        };
        reader.readAsDataURL(file);
    };

    // File upload handling (PDF, PNG, JPEG)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        setSignatureFileName(file.name);

        if (isPdf) {
            setSignatureFileType('pdf');
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setSignaturePreview(base64);
                updateField('digitalSignature', `[PDF_DOCUMENT]: ${file.name} (${base64.substring(0, 100)}...)`);
            };
            reader.readAsDataURL(file);
        } else {
            setSignatureFileType('image');
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setSignaturePreview(result);
                updateField('digitalSignature', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearSignature = () => {
        setSignaturePreview(null);
        setSignatureFileName(null);
        setSignatureFileType(null);
        updateField('digitalSignature', '');
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validateForm = () => {
        const finalData = {
            ...formData,
            applicationType: 'BUSINESS',
            mailingAddress: formData.isMailingSame ? formData.residentialAddress : formData.mailingAddress,
            initialDepositAmount: Number(formData.initialDepositAmount)
        };
        const result = registrationSchema.safeParse(finalData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                if (issue.path[0]) {
                    newErrors[issue.path[0].toString()] = issue.message;
                }
            }
            return newErrors;
        }
        return {};
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
                applicationType: 'BUSINESS',
                mailingAddress: formData.isMailingSame ? formData.residentialAddress : formData.mailingAddress,
                initialDepositAmount: Number(formData.initialDepositAmount)
            };

            await submitRegistrationForm(application.registrationToken, finalData);
            // clear localStorage auto-save
            localStorage.removeItem(`business_registration_${application.id}`);
            
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            console.error('Submission error:', error);
            setErrors({ submit: error?.message || 'Failed to submit registration form. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white p-8 md:p-14 shadow-2xl border-2 border-[#0D2545] rounded-xl text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest font-bold text-neutral-500">
                        Official Execution Receipt
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#0D2545] tracking-tight">
                        Registration Application Submitted
                    </h2>
                    <p className="text-xs font-mono text-neutral-600">
                        DOSSIER HASH: {application.registrationToken.substring(0, 16).toUpperCase()}...
                    </p>
                </div>
                <p className="text-neutral-700 text-sm max-w-lg mx-auto leading-relaxed">
                    Thank you, <strong>{formData.fullLegalName}</strong>. Your Customer Identification Program (CIP) application, attached credentials, and verified digital signature have been recorded.
                </p>
                <div className="p-4 bg-neutral-50 border border-neutral-300 max-w-md mx-auto text-left text-xs text-neutral-700 space-y-1.5 font-mono">
                    <div><strong>APPLICANT:</strong> {formData.fullLegalName}</div>
                    <div><strong>ACCOUNT TYPE:</strong> {formData.desiredAccountType}</div>
                    <div><strong>INITIAL FUNDING:</strong> ${Number(formData.initialDepositAmount).toFixed(2)}</div>
                    <div><strong>DATE OF EXECUTION:</strong> {formData.signatureDate}</div>
                    <div><strong>STATUS:</strong> PENDING COMPLIANCE PROVISIONING</div>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="px-8 py-3 bg-[#0D2545] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1B355B] transition-colors shadow"
                    >
                        Access Heritage Vault Portal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Hidden Inputs */}
            <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraFileInput}
            />
            <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileUpload}
            />
            <input
                type="file"
                ref={photoInputRef}
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handlePhotoUpload}
            />
            <input
                type="file"
                ref={idFrontInputRef}
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleIdUpload(e.target.files[0], 'front')}
            />
            <input
                type="file"
                ref={idBackInputRef}
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleIdUpload(e.target.files[0], 'back')}
            />

            {/* Live Camera Modal (Desktop & Interactive Camera) */}
            {activeCameraTarget && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-300">
                        <div className="bg-[#0D2545] text-white px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-amber-400" />
                                <span className="font-bold text-xs uppercase tracking-wide">
                                    {activeCameraTarget === 'signature' ? 'Snap Signature with Camera' : 'Capture Passport Photograph / Selfie'}
                                </span>
                            </div>
                            <button onClick={stopCamera} className="text-white/70 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-xs text-neutral-600 text-center">
                                {activeCameraTarget === 'signature'
                                    ? 'Hold up your signed document in front of the lens, align within the frame, and click Snap Signature.'
                                    : 'Position your face clearly within the frame and click Capture Photo.'}
                            </p>
                            <div className="relative bg-black rounded overflow-hidden aspect-video flex items-center justify-center">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <div className="absolute inset-4 border-2 border-dashed border-amber-400/70 pointer-events-none flex items-center justify-center">
                                    <span className="text-xs text-amber-300 bg-black/60 px-2 py-1 rounded font-mono">
                                        {activeCameraTarget === 'signature' ? 'Align signature here' : 'Align face here'}
                                    </span>
                                </div>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={stopCamera}
                                    className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded border border-neutral-300 uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="px-5 py-2 text-xs font-bold text-white bg-[#0D2545] hover:bg-[#1B355B] rounded flex items-center gap-1.5 uppercase tracking-wide"
                                >
                                    <Camera className="w-4 h-4" />
                                    Capture
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Actions */}
            <div className="flex justify-end mb-4 print:hidden">
                <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 bg-white border border-[#0D2545] text-[#0D2545] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-50 transition-colors shadow-sm rounded"
                >
                    <Download className="w-4 h-4" />
                    Download Form (PDF)
                </button>
            </div>

            {/* Embedded Fillable PDF Form Container (Styled after Stanbic Bank & SBB West Bank Forms) */}
            <form
                onSubmit={handleSubmit}
                className="bg-white text-neutral-900 shadow-2xl shadow-black/80 border-2 border-[#0D2545] rounded-xl overflow-hidden relative font-sans text-xs print:shadow-none print:border-none"
            >
                {/* Print-only Hard Copy Instructions */}
                <div className="hidden print:block p-6 bg-neutral-50 border-b-2 border-dashed border-neutral-300">
                    <h3 className="font-bold uppercase mb-2 text-[#0D2545] text-sm">Hard Copy Submission Instructions</h3>
                    <p className="mb-1 text-xs text-neutral-800">If you are filling out this form by hand, please return the completed and signed physical copy to our central post office address:</p>
                    <p className="font-mono mt-2 mb-3 text-xs font-bold text-[#0D2545]">Heritage Trust Bank, N.A.<br/>PO Box 10293, Wall Street Station<br/>New York, NY 10005</p>
                    <p className="text-xs text-neutral-800">Alternatively, you may scan the complete, signed form along with copies of your ID and email them securely to: <strong>onboarding@heritagetrust.com</strong></p>
                    {downloadTimestamp && (
                        <p className="mt-4 pt-3 border-t border-neutral-300 font-mono text-[10px] text-neutral-500 font-bold uppercase">
                            DOCUMENT GENERATED ON: {downloadTimestamp}
                        </p>
                    )}
                </div>

                {/* 1. Official Bank Letterhead & Header (Stanbic Bank Layout) */}
                <div className="p-6 md:p-8 bg-white border-b-2 border-[#0D2545]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        {/* Left: Bank Logo & Group Affiliation */}
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center justify-center bg-[#0D2545] px-5 py-3 rounded shadow-md mb-2 print:border-2 print:border-black print:bg-[#0D2545] print:shadow-none">
                                <img
                                    src="/images/logos/heritage-trust-logo-reversed.svg"
                                    alt="Heritage Trust Bank Logo"
                                    className="h-10 md:h-12 w-auto object-contain"
                                />
                            </div>
                            <p className="text-[11px] font-semibold text-neutral-600 tracking-tight">
                                A member of Heritage Financial Group • Established 1888
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono">
                                100 Wall Street, 28th Floor, New York, NY 10005 • Member FDIC • Fedwire: 021000089
                            </p>
                        </div>

                        {/* Right: Form Title & Control Info */}
                        <div className="text-left md:text-right space-y-1">
                            <h1 className="text-xl md:text-2xl font-bold text-[#0D2545] tracking-tight">
                                Application to open Business account
                            </h1>
                            <p className="text-[11px] font-mono font-bold text-neutral-600">
                                FORM JPH-CIP-1040 (REV. 2026)
                            </p>
                            <span className="inline-block text-[10px] font-mono bg-blue-50 text-[#0D2545] px-2 py-0.5 border border-blue-200">
                                USA PATRIOT ACT § 326 COMPLIANT
                            </span>
                        </div>
                    </div>

                    {/* Instruction & Header Metadata Strip */}
                    <div className="mt-6 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-[11px]">
                        <div>
                            <span className="font-bold text-neutral-800">Please complete in </span>
                            <span className="font-black text-[#0D2545] uppercase tracking-wider">BLOCK</span>
                            <span className="font-bold text-neutral-800"> letters.</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
                            <div>
                                <span className="text-neutral-500 mr-1.5">Branch:</span>
                                <span className="font-bold text-neutral-800 underline decoration-neutral-300">Wall Street HQ</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 mr-1.5">Date (DD-MM-YYYY):</span>
                                <span className="font-bold text-[#0D2545] bg-neutral-100 px-2 py-0.5 border border-neutral-300">
                                    {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
                                </span>
                            </div>
                            <div>
                                <span className="text-neutral-500 mr-1.5">CIF / Token:</span>
                                <span className="font-bold text-[#0D2545] bg-neutral-100 px-2 py-0.5 border border-neutral-300">
                                    {application.registrationToken.substring(0, 10).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-red-100 border-b border-red-300 text-red-800 text-center font-bold text-xs">
                        {errors.submit ? errors.submit : 'Please correct the errors highlighted below before submitting.'}
                    </div>
                )}

                <div className={step === 1 ? 'block' : 'hidden print:block'}>
                {/* 2. Accounts Required Section (Stanbic Style) */}
                <div className="border-b border-[#0D2545]">
                    <div className="bg-[#0D2545] text-white font-bold text-xs uppercase px-4 py-2 flex items-center justify-between">
                        <span>Accounts required</span>
                        <span className="text-[10px] font-mono text-blue-200">SECTION 1</span>
                    </div>
                    <div className="p-4 bg-neutral-50/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { id: 'Everyday Checking', label: 'Everyday Checking' },
                                { id: 'High-Yield Savings', label: 'High-Yield Savings' },
                                { id: 'Certificate of Deposit', label: 'Certificate of Deposit' },
                                { id: 'Private Wealth Reserve', label: 'Private Wealth Reserve' },
                            ].map((acc) => (
                                <label
                                    key={acc.id}
                                    className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-colors ${formData.desiredAccountType === acc.id
                                        ? 'bg-blue-50/80 border-[#0D2545] font-bold text-[#0D2545]'
                                        : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="accountType"
                                        className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                        checked={formData.desiredAccountType === acc.id}
                                        onChange={() => updateField('desiredAccountType', acc.id)}
                                    />
                                    <span className="text-xs">{acc.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Currency Selector */}
                        <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-wrap items-center gap-4 text-xs">
                            <span className="font-bold text-neutral-700">Account Currency:</span>
                            {['USD ($)', 'EUR (€)', 'GBP (£)'].map((curr) => {
                                const code = curr.substring(0, 3);
                                return (
                                    <label key={code} className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="currency"
                                            className="w-3.5 h-3.5 text-[#0D2545] rounded-none focus:ring-0"
                                            checked={formData.currencyPreference === code}
                                            onChange={() => updateField('currencyPreference', code)}
                                        />
                                        <span className="font-mono font-medium">{curr}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. Personal Details Section (Grid Structure from Stanbic & SBB West Bank) */}
                <div className="border-b border-[#0D2545]">
                    <div className="bg-[#0D2545] text-white font-bold text-xs uppercase px-4 py-2 flex items-center justify-between">
                        <span>Business Entity & Authorized Signatory details</span>
                        <span className="text-[10px] font-mono text-blue-200">SECTION 2</span>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Row 1: Passport Photo Affix Box & Basic Info */}
                        <div className="grid md:grid-cols-12 gap-4">
                            <div className="md:col-span-9 space-y-3">


                                {/* Full Legal Name */}
                                <div className="border border-neutral-300 p-2 bg-white">
                                    <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                        Authorized Signatory Name (Must match official ID) <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="JOHN ALEXANDER DOE"
                                        className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.fullLegalName ? 'border-red-600' : 'border-neutral-200'} font-bold text-xs uppercase outline-none focus:bg-white focus:border-[#0D2545]`}
                                        value={formData.fullLegalName}
                                        onChange={(e) => updateField('fullLegalName', e.target.value.toUpperCase())}
                                    />
                                    {errors.fullLegalName && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.fullLegalName}</p>}
                                </div>


                                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                                        <div className="border border-neutral-300 p-2 bg-white sm:col-span-2">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                Business Name (Legal) <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.businessName ? 'border-red-600' : 'border-neutral-200'} font-bold text-xs uppercase outline-none focus:bg-white`}
                                                value={formData.businessName}
                                                onChange={(e) => updateField('businessName', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                DBA Name / Trading As
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-bold text-xs uppercase outline-none focus:bg-white"
                                                value={formData.dbaName}
                                                onChange={(e) => updateField('dbaName', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                Business Tax ID (EIN) <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.ein ? 'border-red-600' : 'border-neutral-200'} font-bold text-xs uppercase outline-none focus:bg-white`}
                                                value={formData.ein}
                                                onChange={(e) => updateField('ein', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                Entity Type <span className="text-red-600">*</span>
                                            </label>
                                            <select
                                                className="w-full bg-transparent font-medium text-xs outline-none"
                                                value={formData.entityType}
                                                onChange={(e) => updateField('entityType', e.target.value)}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="LLC">LLC</option>
                                                <option value="CORPORATION">Corporation</option>
                                                <option value="PARTNERSHIP">Partnership</option>
                                                <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                                            </select>
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                Registration Number
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-bold text-xs uppercase outline-none focus:bg-white"
                                                value={formData.businessRegistrationNo}
                                                onChange={(e) => updateField('businessRegistrationNo', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                State/Country of Formation
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-bold text-xs uppercase outline-none focus:bg-white"
                                                value={formData.stateOfFormation}
                                                onChange={(e) => updateField('stateOfFormation', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                Year of Formation
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-bold text-xs uppercase outline-none focus:bg-white"
                                                value={formData.yearOfFormation}
                                                onChange={(e) => updateField('yearOfFormation', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                Industry / Sector
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-bold text-xs uppercase outline-none focus:bg-white"
                                                value={formData.industry}
                                                onChange={(e) => updateField('industry', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                Business Website
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-bold text-xs uppercase outline-none focus:bg-white"
                                                value={formData.website}
                                                onChange={(e) => updateField('website', e.target.value.toLowerCase())}
                                            />
                                        </div>
                                        <div className="border border-neutral-300 p-2 bg-white sm:col-span-2">
                                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                                UBO Declaration (Owners with {'>'}25%)
                                            </label>
                                            <textarea
                                                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-bold text-xs uppercase outline-none focus:bg-white resize-none"
                                                rows={2}
                                                value={formData.uboDeclaration}
                                                onChange={(e) => updateField('uboDeclaration', e.target.value.toUpperCase())}
                                                placeholder="List full names of all Ultimate Beneficial Owners..."
                                            />
                                        </div>
                                    </div>

                            </div>

                            {/* Passport Photo Box (Affix Passport Photograph here - SBB West Bank Style) */}
                            <div className="md:col-span-3">
                                <div className="border-2 border-dashed border-[#0D2545]/40 h-full min-h-[120px] p-2 flex flex-col items-center justify-center text-center bg-neutral-50">
                                    {photoPreview ? (
                                        <div className="relative w-full h-full flex flex-col items-center">
                                            <img src={photoPreview} alt="Applicant Photo" className="w-20 h-24 object-cover border border-neutral-400 mb-1" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPhotoPreview(null);
                                                    updateField('passportPhotoUrl', '');
                                                }}
                                                className="text-[10px] text-red-700 font-bold underline print:hidden"
                                            >
                                                Retake Photo
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0D2545] mb-1">
                                                <UserCheck className="w-4 h-4" />
                                            </div>
                                            <span className="text-[9px] font-bold uppercase text-[#0D2545] leading-tight block mb-1.5">
                                                Affix Passport Photograph / Selfie
                                            </span>
                                            <div className="flex items-center gap-1.5 print:hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => openCamera('photo')}
                                                    className="px-2 py-1 bg-[#0D2545] text-white text-[9px] font-bold rounded-none flex items-center gap-1"
                                                >
                                                    <Camera className="w-2.5 h-2.5" /> Snap
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => photoInputRef.current?.click()}
                                                    className="px-2 py-1 bg-white border border-neutral-300 text-neutral-800 text-[9px] font-bold rounded-none"
                                                >
                                                    Upload
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Date of Birth & SSN / ITIN */}
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Date of Birth (YYYY-MM-DD) <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.dateOfBirth ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.dateOfBirth}
                                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                                />
                                {errors.dateOfBirth && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.dateOfBirth}</p>}
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    SSN / ITIN / Tax ID <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="XXX-XX-XXXX"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.ssnItin ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.ssnItin}
                                    onChange={(e) => updateField('ssnItin', e.target.value)}
                                />
                                {errors.ssnItin && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.ssnItin}</p>}
                            </div>


                        </div>

                        {/* Row 3: Nationality & Country of Residence */}
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Primary Nationality
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 text-xs outline-none focus:bg-white focus:border-[#0D2545]"
                                    value={formData.nationality}
                                    onChange={(e) => updateField('nationality', e.target.value)}
                                />
                            </div>
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Country of Residence
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 text-xs outline-none focus:bg-white focus:border-[#0D2545]"
                                    value={formData.countryOfResidence}
                                    onChange={(e) => updateField('countryOfResidence', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Row 4: Physical Residential Address */}
                        <div className="border border-neutral-300 p-2 bg-white">
                            <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                Physical Residential Address (Street, Apt/Suite, City, State, ZIP) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="100 WALL STREET, SUITE 400, NEW YORK, NY 10005"
                                className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.residentialAddress ? 'border-red-600' : 'border-neutral-200'} font-medium text-xs outline-none focus:bg-white focus:border-[#0D2545] uppercase`}
                                value={formData.residentialAddress}
                                onChange={(e) => updateField('residentialAddress', e.target.value.toUpperCase())}
                            />
                            {errors.residentialAddress && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.residentialAddress}</p>}

                            <div className="mt-2 pt-2 border-t border-neutral-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 text-[#0D2545] rounded-none focus:ring-0"
                                        checked={formData.isMailingSame}
                                        onChange={(e) => updateField('isMailingSame', e.target.checked)}
                                    />
                                    <span className="text-[11px] font-bold text-neutral-700 uppercase">
                                        Mailing Address is same as Residential
                                    </span>
                                </label>
                                {!formData.isMailingSame && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="P.O. Box or alternate mailing address"
                                            className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-medium text-xs outline-none focus:bg-white focus:border-[#0D2545] uppercase"
                                            value={formData.mailingAddress}
                                            onChange={(e) => updateField('mailingAddress', e.target.value.toUpperCase())}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Row 5: Telephone & Email */}
                        <div className="grid sm:grid-cols-3 gap-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Primary Telephone (Mobile)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full bg-neutral-100 px-2 py-1.5 border border-neutral-200 font-mono text-xs text-neutral-600 cursor-not-allowed"
                                    value={application.phone || 'Inherited from preliminary dossier'}
                                />
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Secondary / Work Telephone
                                </label>
                                <input
                                    type="text"
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]"
                                    value={formData.secondaryPhone}
                                    onChange={(e) => updateField('secondaryPhone', e.target.value)}
                                />
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Email Address (Online Banking Login ID)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full bg-neutral-100 px-2 py-1.5 border border-neutral-200 font-mono text-xs text-neutral-600 cursor-not-allowed"
                                    value={application.email}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                <div className={step === 2 ? 'block' : 'hidden print:block'}>
                {/* 4. Employment Details Section (Stanbic Style) */}
                <div className="border-b border-[#0D2545]">
                    <div className="bg-[#0D2545] text-white font-bold text-xs uppercase px-4 py-2 flex items-center justify-between">
                        <span>Business Operations & Financial Profile</span>
                        <span className="text-[10px] font-mono text-blue-200">SECTION 3</span>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="grid sm:grid-cols-3 gap-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Employment Status <span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="w-full bg-transparent font-medium text-xs outline-none"
                                    value={formData.employmentStatus}
                                    onChange={(e) => updateField('employmentStatus', e.target.value)}
                                >
                                    <option>Employed</option>
                                    <option>Self-Employed</option>
                                    <option>Retired</option>
                                    <option>Student</option>
                                    <option>Unemployed</option>
                                </select>
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Number of Employees <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 50"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.occupation ? 'border-red-600' : 'border-neutral-200'} text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.occupation}
                                    onChange={(e) => updateField('occupation', e.target.value)}
                                />
                                {errors.occupation && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.occupation}</p>}
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Industry / Sector <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Technology, Manufacturing"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.employerName ? 'border-red-600' : 'border-neutral-200'} text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.employerName}
                                    onChange={(e) => updateField('employerName', e.target.value)}
                                />
                                {errors.employerName && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.employerName}</p>}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Source of Funds
                                </label>
                                <select
                                    className="w-full bg-transparent font-medium text-xs outline-none"
                                    value={formData.primarySourceOfFunds}
                                    onChange={(e) => updateField('primarySourceOfFunds', e.target.value)}
                                >
                                    <option>Salary/Wages</option>
                                    <option>Investments / Dividends</option>
                                    <option>Business Profits</option>
                                    <option>Inheritance / Trust</option>
                                    <option>Personal Savings</option>
                                </select>
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Estimated Gross Annual Income (USD)
                                </label>
                                <select
                                    className="w-full bg-transparent font-medium text-xs outline-none"
                                    value={formData.estimatedAnnualIncome}
                                    onChange={(e) => updateField('estimatedAnnualIncome', e.target.value)}
                                >
                                    <option value="0-50000">$0 – $50,000</option>
                                    <option value="50000-100000">$50,000 – $100,000</option>
                                    <option value="100000-250000">$100,000 – $250,000</option>
                                    <option value="250000+">$250,000+</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-3 mt-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Purpose of Account <span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="w-full bg-transparent font-medium text-xs outline-none"
                                    value={formData.purposeOfAccount}
                                    onChange={(e) => updateField('purposeOfAccount', e.target.value)}
                                >
                                    <option value="">Select Purpose</option>
                                    <option value="Personal / Household Expenses">Personal / Household Expenses</option>
                                    <option value="Payroll / Salary Deposit">Payroll / Salary Deposit</option>
                                    <option value="Business Operations">Business Operations</option>
                                    <option value="Investment / Savings">Investment / Savings</option>
                                    <option value="Trust / Estate Management">Trust / Estate Management</option>
                                </select>
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Expected Monthly Volume (USD) <span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="w-full bg-transparent font-medium text-xs outline-none"
                                    value={formData.expectedMonthlyVolume}
                                    onChange={(e) => updateField('expectedMonthlyVolume', e.target.value)}
                                >
                                    <option value="">Select Expected Volume</option>
                                    <option value="0-10000">Up to $10,000</option>
                                    <option value="10000-50000">$10,000 – $50,000</option>
                                    <option value="50000-250000">$50,000 – $250,000</option>
                                    <option value="250000+">More than $250,000</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Means of Identification (SBB West Bank Style) */}
                <div className="border-b border-[#0D2545]">
                    <div className="bg-[#0D2545] text-white font-bold text-xs uppercase px-4 py-2 flex items-center justify-between">
                        <span>Means of identification</span>
                        <span className="text-[10px] font-mono text-blue-200">SECTION 4</span>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="grid sm:grid-cols-5 gap-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Primary ID Type <span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="w-full bg-transparent font-medium text-xs outline-none"
                                    value={formData.primaryIdType}
                                    onChange={(e) => updateField('primaryIdType', e.target.value)}
                                >
                                    <option>Driver's License</option>
                                    <option>State ID Card</option>
                                    <option>Passport</option>
                                    <option>Permanent Resident Card</option>
                                </select>
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    ID Card Number <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.idNumber ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.idNumber}
                                    onChange={(e) => updateField('idNumber', e.target.value)}
                                />
                                {errors.idNumber && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.idNumber}</p>}
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    State / Country <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.stateCountryOfIssuance ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.stateCountryOfIssuance}
                                    onChange={(e) => updateField('stateCountryOfIssuance', e.target.value)}
                                />
                                {errors.stateCountryOfIssuance && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.stateCountryOfIssuance}</p>}
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Issue Date (YYYY-MM-DD) <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.issueDate ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.issueDate}
                                    onChange={(e) => updateField('issueDate', e.target.value)}
                                />
                                {errors.issueDate && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.issueDate}</p>}
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Expiry Date (YYYY-MM-DD) <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.expirationDate ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.expirationDate}
                                    onChange={(e) => updateField('expirationDate', e.target.value)}
                                />
                                {errors.expirationDate && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.expirationDate}</p>}
                            </div>
                        </div>

                        {/* ID Document Attachments */}
                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                            <div className="border border-neutral-300 p-3 bg-neutral-50 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-[11px] text-neutral-800 block uppercase">
                                        ID Document Photo (Front)
                                    </span>
                                    <span className="text-[10px] text-neutral-500">Attach front of photo ID</span>
                                </div>
                                {formData.idFrontDocumentUrl ? (
                                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => idFrontInputRef.current?.click()}
                                        className="px-3 py-1.5 bg-[#0D2545] text-white text-[10px] font-bold uppercase tracking-wider rounded-none print:hidden"
                                    >
                                        Select File
                                    </button>
                                )}
                            </div>

                            <div className="border border-neutral-300 p-3 bg-neutral-50 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-[11px] text-neutral-800 block uppercase">
                                        ID Document Photo (Back)
                                    </span>
                                    <span className="text-[10px] text-neutral-500">Attach back / barcode side</span>
                                </div>
                                {formData.idBackDocumentUrl ? (
                                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => idBackInputRef.current?.click()}
                                        className="px-3 py-1.5 bg-[#0D2545] text-white text-[10px] font-bold uppercase tracking-wider rounded-none print:hidden"
                                    >
                                        Select File
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Proof of Address Document Attachment */}
                        <div className="border border-neutral-300 p-3 bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-3">
                            <div>
                                <span className="font-bold text-[11px] text-neutral-800 block uppercase">
                                    Proof of Address (Utility Bill, Bank Statement, etc.)
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 text-[#0D2545] rounded focus:ring-0"
                                            checked={formData.poaWaiverRequested}
                                            onChange={(e) => updateField('poaWaiverRequested', e.target.checked)}
                                        />
                                        <span className="text-[10px] text-neutral-600 font-bold uppercase">Request Waiver</span>
                                    </label>
                                </div>
                            </div>
                            
                            {!formData.poaWaiverRequested && (
                                <>
                                    {formData.proofOfAddressUrl ? (
                                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                                        </span>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    alert("PoA Upload mock triggered. In a real environment, this opens file selection.");
                                                    updateField('proofOfAddressUrl', 'mock-url');
                                                }}
                                                className={`px-3 py-1.5 bg-[#0D2545] text-white text-[10px] font-bold uppercase tracking-wider rounded-none print:hidden ${errors.proofOfAddressUrl ? 'ring-2 ring-red-600' : ''}`}
                                            >
                                                Select Document
                                            </button>
                                            {errors.proofOfAddressUrl && <span className="text-[10px] text-red-600 font-bold">{errors.proofOfAddressUrl}</span>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                </div>



                <div className={step === 3 ? 'block' : 'hidden print:block'}>
                {/* 7. E-Banking & Account Funding (Stanbic Style) */}
                <div className="border-b border-[#0D2545]">
                    <div className="bg-[#0D2545] text-white font-bold text-xs uppercase px-4 py-2 flex items-center justify-between">
                        <span>E-Banking & Initial Funding details</span>
                        <span className="text-[10px] font-mono text-blue-200">SECTION 6</span>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Initial Deposit Amount ($ USD) <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="500.00"
                                    className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.initialDepositAmount ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                    value={formData.initialDepositAmount}
                                    onChange={(e) => updateField('initialDepositAmount', e.target.value)}
                                />
                                {errors.initialDepositAmount && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.initialDepositAmount}</p>}
                            </div>

                            <div className="border border-neutral-300 p-2 bg-white">
                                <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                    Funding Method <span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="w-full bg-transparent font-medium text-xs outline-none"
                                    value={formData.fundingMethod}
                                    onChange={(e) => updateField('fundingMethod', e.target.value)}
                                >
                                    <option>External Bank Transfer (ACH)</option>
                                    <option>Incoming Wire Transfer</option>
                                    <option>Mobile Check Deposit</option>
                                </select>
                            </div>
                        </div>

                        {formData.fundingMethod === 'External Bank Transfer (ACH)' && (
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div className="border border-neutral-300 p-2 bg-white">
                                    <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                        External Bank 9-Digit Routing Number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={9}
                                        placeholder="XXXXXXXXX"
                                        className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.externalAccountRoutingNumber ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                        value={formData.externalAccountRoutingNumber}
                                        onChange={(e) => updateField('externalAccountRoutingNumber', e.target.value)}
                                    />
                                    {errors.externalAccountRoutingNumber && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.externalAccountRoutingNumber}</p>}
                                </div>

                                <div className="border border-neutral-300 p-2 bg-white">
                                    <label className="block text-[10px] font-bold uppercase text-[#0D2545] mb-1">
                                        External Bank Account Number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="XXXXXXXXXXXX"
                                        className={`w-full bg-neutral-50 px-2 py-1.5 border ${errors.externalAccountNumber ? 'border-red-600' : 'border-neutral-200'} font-mono text-xs outline-none focus:bg-white focus:border-[#0D2545]`}
                                        value={formData.externalAccountNumber}
                                        onChange={(e) => updateField('externalAccountNumber', e.target.value)}
                                    />
                                    {errors.externalAccountNumber && <p className="text-[10px] text-red-600 mt-0.5 font-bold">{errors.externalAccountNumber}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </div>

                <div className={step === 4 ? 'block' : 'hidden print:block'}>
                {/* 8. Consent & Regulatory Disclosures (Two-Column Table from Stanbic Bank Form) */}
                <div className="border-b border-[#0D2545]">
                    <div className="bg-[#0D2545] text-white font-bold text-xs uppercase px-4 py-2 flex items-center justify-between">
                        <span>Consent & Regulatory Declarations</span>
                        <span className="text-[10px] font-mono text-blue-200">SECTION 7</span>
                    </div>

                    <div className="p-4">
                        <table className="w-full border-collapse border border-neutral-300 text-[11px]">
                            <thead>
                                <tr className="bg-neutral-100 text-[#0D2545]">
                                    <th className="border border-neutral-300 p-2.5 text-left font-bold uppercase">
                                        Consent & Certification Items
                                    </th>
                                    <th className="border border-neutral-300 p-2.5 text-center font-bold uppercase w-28">
                                        Please Tick
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                        <strong>Tax Residency:</strong> I am a U.S. Person for tax purposes.
                                        {errors.isUsTaxPerson && <p className="text-red-600 font-bold mt-1">{errors.isUsTaxPerson}</p>}
                                    </td>
                                    <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={formData.isUsTaxPerson}
                                                    onChange={(e) => updateField('isUsTaxPerson', e.target.checked)}
                                                />
                                                <span className="font-bold">Yes</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                                
                                {!formData.isUsTaxPerson && (
                                    <tr>
                                        <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                            <strong>Foreign Tax Residencies:</strong> Please list any foreign countries where you are a tax resident.
                                            {errors.foreignTaxResidencies && <p className="text-red-600 font-bold mt-1">{errors.foreignTaxResidencies}</p>}
                                        </td>
                                        <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                            <input
                                                type="text"
                                                className="w-full bg-white px-2 py-1 border border-neutral-300 text-xs outline-none focus:border-[#0D2545]"
                                                value={formData.foreignTaxResidencies}
                                                onChange={(e) => updateField('foreignTaxResidencies', e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                )}

                                <tr>
                                    <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                        {formData.isUsTaxPerson ? (
                                            <>
                                                <strong>W-9 Taxpayer Identification Certification:</strong> Under penalties of perjury, I certify that: (1) The number shown on this form is my correct taxpayer identification number; (2) I am not subject to backup withholding; and (3) I am a U.S. citizen or other U.S. person.
                                                {errors.w9Certification && <p className="text-red-600 font-bold mt-1">{errors.w9Certification}</p>}
                                            </>
                                        ) : (
                                            <>
                                                <strong>W-8BEN Certification:</strong> Under penalties of perjury, I declare that I have examined the information on this form and to the best of my knowledge and belief it is true, correct, and complete. I further certify that I am not a U.S. person.
                                                {errors.w8benCertification && <p className="text-red-600 font-bold mt-1">{errors.w8benCertification}</p>}
                                            </>
                                        )}
                                    </td>
                                    <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={formData.isUsTaxPerson ? formData.w9Certification : formData.w8benCertification}
                                                    onChange={(e) => updateField(formData.isUsTaxPerson ? 'w9Certification' : 'w8benCertification', e.target.checked)}
                                                />
                                                <span className="font-bold">Yes</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                        <strong>PEP Declaration:</strong> Are you, or is any immediate family member, a Politically Exposed Person (PEP)?
                                        {formData.isPep && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    placeholder="Provide PEP details/position..."
                                                    className={`w-full bg-white px-2 py-1.5 border ${errors.pepDetails ? 'border-red-600' : 'border-neutral-300'} text-xs outline-none focus:border-[#0D2545]`}
                                                    value={formData.pepDetails}
                                                    onChange={(e) => updateField('pepDetails', e.target.value)}
                                                />
                                                {errors.pepDetails && <p className="text-red-600 font-bold mt-1 text-[10px]">{errors.pepDetails}</p>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={formData.isPep}
                                                    onChange={(e) => updateField('isPep', e.target.checked)}
                                                />
                                                <span className="font-bold">Yes</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                        <strong>Sanctions Declaration:</strong> I declare that I am not designated on any global sanctions lists (e.g., OFAC, UN, EU, UK).
                                        {errors.sanctionsDeclaration && <p className="text-red-600 font-bold mt-1">{errors.sanctionsDeclaration}</p>}
                                    </td>
                                    <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={formData.sanctionsDeclaration}
                                                    onChange={(e) => updateField('sanctionsDeclaration', e.target.checked)}
                                                />
                                                <span className="font-bold">Yes</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                        <strong>Electronic Communications & Records Consent:</strong> I agree to receive all account disclosures, monthly notices, and official statements in electronic format pursuant to the E-SIGN Act.
                                        {errors.electronicCommunicationsDisclosure && <p className="text-red-600 font-bold mt-1">{errors.electronicCommunicationsDisclosure}</p>}
                                    </td>
                                    <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={formData.electronicCommunicationsDisclosure}
                                                    onChange={(e) => updateField('electronicCommunicationsDisclosure', e.target.checked)}
                                                />
                                                <span className="font-bold">Yes</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                        <strong>Deposit Account Agreement & Truth in Savings:</strong> I have received, read, and agree to the Heritage Trust Bank Deposit Account Agreement, Fee Schedule, and Funds Availability Policy.
                                        {errors.depositAccountAgreement && <p className="text-red-600 font-bold mt-1">{errors.depositAccountAgreement}</p>}
                                    </td>
                                    <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={formData.depositAccountAgreement}
                                                    onChange={(e) => updateField('depositAccountAgreement', e.target.checked)}
                                                />
                                                <span className="font-bold">Yes</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border border-neutral-300 p-2.5 text-neutral-800 leading-snug">
                                        <strong>Marketing & Financial Advisory Communications:</strong> I consent that the Bank may communicate related commercial products, wealth advisory updates, and special investment services to me.
                                    </td>
                                    <td className="border border-neutral-300 p-2.5 text-center bg-neutral-50/50">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={formData.marketingConsent}
                                                    onChange={(e) => updateField('marketingConsent', e.target.checked)}
                                                />
                                                <span className="font-bold">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#0D2545] rounded-none focus:ring-0"
                                                    checked={!formData.marketingConsent}
                                                    onChange={(e) => updateField('marketingConsent', !e.target.checked)}
                                                />
                                                <span className="font-bold">No</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 9. Declaration & Specimen Signature (SBB West Bank & Stanbic Style) */}
                <div className="p-6 md:p-8 bg-white">
                    <div className="bg-[#0D2545] text-white font-bold text-xs uppercase px-4 py-2 flex items-center justify-between mb-4">
                        <span>Declaration & Specimen Signature</span>
                        <span className="text-[10px] font-mono text-blue-200">SECTION 8</span>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-300 text-[11px] text-neutral-700 leading-relaxed mb-6">
                        <strong>DECLARATION:</strong> I/We hereby apply for the opening of account(s) with Heritage Trust Bank, N.A. I/We understand that the information given herein and the documents supplied are the basis for opening such account(s) and I/We therefore warrant that such information is correct, complete, and not misleading. I/We further undertake to indemnify the Bank for any loss suffered as a result of any false information provided.
                    </div>

                    {/* Two Working Buttons */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-4 print:hidden">
                        <button
                            type="button"
                            onClick={() => openCamera('signature')}
                            className="py-3 px-4 bg-[#0D2545] hover:bg-[#1B355B] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-[#0D2545] shadow-sm"
                        >
                            <Camera className="w-4 h-4 text-amber-400" />
                            <span>1. Snap Signature (Camera)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-neutral-400 shadow-sm"
                        >
                            <Upload className="w-4 h-4 text-[#0D2545]" />
                            <span>2. Upload Signature (PDF / PNG / JPEG)</span>
                        </button>
                    </div>

                    {/* Specimen Signature Box (Styled after SBB Specimen 1 & Stanbic) */}
                    <div className={`p-5 border-2 ${errors.digitalSignature ? 'border-red-600 bg-red-50/40' : 'border-[#0D2545] bg-white'} relative`}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            {/* Left: Specimen Signature Area */}
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-[#0D2545] uppercase tracking-wider block mb-2">
                                    SPECIMEN 1 — PRIMARY APPLICANT SIGNATURE
                                </span>

                                {signaturePreview ? (
                                    <div className="space-y-2">
                                        {signatureFileType === 'image' ? (
                                            <div className="p-2 bg-neutral-50 border border-neutral-300 inline-block">
                                                <img
                                                    src={signaturePreview}
                                                    alt="Signature Preview"
                                                    className="max-h-20 max-w-xs object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-neutral-50 border border-neutral-300 flex items-center gap-3 max-w-sm">
                                                <FileText className="w-6 h-6 text-red-600 shrink-0" />
                                                <div className="truncate">
                                                    <span className="font-bold text-xs text-neutral-900 block truncate">{signatureFileName}</span>
                                                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">PDF Signature Attached</span>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <button
                                                type="button"
                                                onClick={clearSignature}
                                                className="text-[11px] text-red-700 hover:text-red-900 font-bold flex items-center gap-1 print:hidden"
                                            >
                                                <Trash2 className="w-3 h-3" /> Clear / Replace Signature
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-5 border-b-2 border-neutral-800 flex items-end justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-serif font-black text-xl text-neutral-900">X</span>
                                            <span className="text-[11px] font-mono text-neutral-400 italic">
                                                (Signature space — use buttons above to snap or upload)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="text-[11px] font-mono text-neutral-600 mt-2">
                                    NAME: <strong>{formData.fullLegalName || application.firstName + ' ' + application.lastName}</strong>
                                </div>
                            </div>

                            {/* Right: Date */}
                            <div className="md:w-48">
                                <label className="block text-[10px] font-bold text-[#0D2545] uppercase mb-1">
                                    Date (DD-MM-YYYY):
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full px-2.5 py-1.5 bg-neutral-100 border border-neutral-300 text-neutral-800 font-mono text-xs"
                                    value={formData.signatureDate}
                                />
                            </div>
                        </div>

                        {errors.digitalSignature && (
                            <p className="text-xs text-red-600 font-bold mt-3">
                                {errors.digitalSignature}
                            </p>
                        )}
                    </div>

                    </div>

                    {/* Final Submission Button */}
                    <div className="mt-8 pt-6 border-t border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#0D2545] shrink-0" />
                            <span>Encrypted under Section 326 of the USA PATRIOT Act and FDIC guidelines.</span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                                >
                                    Previous Step
                                </button>
                            )}
                            
                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="px-8 py-3.5 bg-[#0D2545] hover:bg-[#1B355B] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                                >
                                    Continue to Step {step + 1}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-md"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Transmitting CIP Dossier...</span>
                                        </>
                                    ) : (
                                        <span>Submit Official Application</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
