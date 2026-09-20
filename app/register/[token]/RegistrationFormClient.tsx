'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
    Camera, 
    Upload, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    RefreshCw, 
    Trash2, 
    Shield, 
    Lock, 
    Building2,
    X
} from 'lucide-react';
import { submitRegistrationForm } from '@/app/actions/registrationForm';

export default function RegistrationFormClient({ application }: { application: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Signature state & refs
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [signatureFileName, setSignatureFileName] = useState<string | null>(null);
    const [signatureFileType, setSignatureFileType] = useState<'image' | 'pdf' | null>(null);
    
    // Live camera modal state
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Hidden input refs
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const idFrontInputRef = useRef<HTMLInputElement | null>(null);
    const idBackInputRef = useRef<HTMLInputElement | null>(null);

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
        primaryIdType: "Driver's License",
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

    // ID document mock upload
    const handleIdUpload = (file: File, type: 'front' | 'back') => {
        const reader = new FileReader();
        reader.onload = () => {
            updateField(type === 'front' ? 'idFrontDocumentUrl' : 'idBackDocumentUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Camera handling
    const openCamera = async () => {
        // First try getUserMedia for interactive viewfinder
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                setCameraStream(stream);
                setIsCameraModalOpen(true);
                setCameraError(null);
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                }, 200);
                return;
            } catch (err) {
                console.warn('getUserMedia failed, falling back to file input camera capture:', err);
            }
        }
        // Fallback: trigger native device camera file input
        cameraInputRef.current?.click();
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraModalOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                setSignaturePreview(dataUrl);
                setSignatureFileType('image');
                setSignatureFileName(`signature_snap_${Date.now()}.png`);
                updateField('digitalSignature', dataUrl);
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
            // For PDF, we can create an object URL or store base64
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
        const newErrors: Record<string, string> = {};

        if (!formData.fullLegalName.trim()) newErrors.fullLegalName = 'Full Legal Name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
        if (!formData.ssnItin.trim()) newErrors.ssnItin = 'SSN / ITIN is required';
        if (!formData.mothersMaidenName.trim()) newErrors.mothersMaidenName = "Mother's Maiden Name is required";

        if (!formData.residentialAddress.trim()) newErrors.residentialAddress = 'Physical residential address is required';
        if (!formData.isMailingSame && !formData.mailingAddress.trim()) newErrors.mailingAddress = 'Mailing address is required';

        if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
        if (!formData.employerName.trim()) newErrors.employerName = 'Employer name is required';

        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID Number is required';
        if (!formData.stateCountryOfIssuance.trim()) newErrors.stateCountryOfIssuance = 'State or Country of Issuance is required';
        if (!formData.issueDate) newErrors.issueDate = 'Issue Date is required';
        if (!formData.expirationDate) newErrors.expirationDate = 'Expiration Date is required';

        if (formData.fundingMethod === 'External Bank Transfer (ACH)') {
            if (!formData.externalAccountRoutingNumber.trim()) newErrors.externalAccountRoutingNumber = 'Routing number is required';
            if (!formData.externalAccountNumber.trim()) newErrors.externalAccountNumber = 'Account number is required';
        }
        if (!formData.initialDepositAmount || Number(formData.initialDepositAmount) < 0) {
            newErrors.initialDepositAmount = 'Initial deposit amount is required';
        }

        if (!formData.w9Certification) newErrors.w9Certification = 'W-9 certification is required by federal law';
        if (!formData.electronicCommunicationsDisclosure) newErrors.electronicCommunicationsDisclosure = 'Electronic disclosure consent is required';
        if (!formData.depositAccountAgreement) newErrors.depositAccountAgreement = 'Deposit account agreement is required';
        if (!formData.digitalSignature) newErrors.digitalSignature = 'Digital signature is required. Please snap or upload a signature.';

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
            <div className="bg-white p-8 md:p-14 shadow-2xl border border-neutral-300 text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest font-bold text-neutral-500">
                        Official Execution Receipt
                    </span>
                    <h2 className="text-3xl font-playfair font-bold text-neutral-900">
                        Registration Application Submitted
                    </h2>
                    <p className="text-sm font-mono text-neutral-600">
                        RECORD HASH: {application.registrationToken.substring(0, 16).toUpperCase()}...
                    </p>
                </div>
                <p className="text-neutral-700 text-base max-w-lg mx-auto leading-relaxed">
                    Thank you, <strong>{formData.fullLegalName}</strong>. Your Customer Identification Program (CIP) application, attached identity credentials, and verified digital signature have been securely transmitted to the JP Heritage Bank Underwriting & Compliance Department.
                </p>
                <div className="p-4 bg-neutral-50 border border-neutral-200 max-w-md mx-auto text-left text-xs text-neutral-600 space-y-1.5 font-mono">
                    <div><strong>APPLICANT:</strong> {formData.fullLegalName}</div>
                    <div><strong>ACCOUNT TYPE:</strong> {application.desiredAccountType || 'Everyday Checking'}</div>
                    <div><strong>INITIAL FUNDING:</strong> ${Number(formData.initialDepositAmount).toFixed(2)}</div>
                    <div><strong>DATE OF EXECUTION:</strong> {formData.signatureDate}</div>
                    <div><strong>STATUS:</strong> PENDING FINAL COMPLIANCE PROVISIONING</div>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="px-8 py-3 bg-[#0D2545] text-white font-semibold text-sm tracking-wider hover:bg-[#1B355B] transition-colors"
                    >
                        Access Heritage Vault Portal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Hidden Inputs for Signature & ID */}
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

            {/* Live Camera Modal (if supported & opened) */}
            {isCameraModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-300">
                        <div className="bg-[#0D2545] text-white px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-amber-400" />
                                <span className="font-semibold text-sm tracking-wide">Snap Signature with Camera</span>
                            </div>
                            <button onClick={stopCamera} className="text-white/70 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-xs text-neutral-600 text-center">
                                Hold up your signed paper signature directly in front of the camera, align within the frame, and click <strong>Snap Signature</strong>.
                            </p>
                            <div className="relative bg-black rounded overflow-hidden aspect-video flex items-center justify-center">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <div className="absolute inset-4 border-2 border-dashed border-amber-400/70 pointer-events-none flex items-center justify-center">
                                    <span className="text-xs text-amber-300 bg-black/60 px-2 py-1 rounded">Align signature here</span>
                                </div>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={stopCamera}
                                    className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded border border-neutral-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0D2545] hover:bg-[#1B355B] rounded flex items-center gap-1.5"
                                >
                                    <Camera className="w-4 h-4" />
                                    Snap Signature
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Embedded Fillable PDF Form Container */}
            <form 
                onSubmit={handleSubmit} 
                className="bg-white text-neutral-900 shadow-2xl shadow-black/80 border border-neutral-300 relative print:shadow-none print:m-0"
            >
                {/* PDF Top Document Metadata Bar */}
                <div className="bg-[#0D2545] text-white px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono tracking-wider border-b border-[#B8960C]">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-300">FORM JPH-CIP-1040 (REV. 2026)</span>
                        <span className="hidden sm:inline text-neutral-300">• OMB Control No. 1557-0811</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-300">
                        <span>CONFIDENTIAL FINANCIAL RECORD</span>
                        <span className="hidden md:inline">• USA PATRIOT ACT § 326 COMPLIANT</span>
                    </div>
                </div>

                {/* Bank Letterhead & Official Form Heading */}
                <div className="p-6 md:p-10 border-b-2 border-neutral-800 bg-gradient-to-b from-neutral-50 to-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-neutral-300">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 shrink-0">
                                <Image
                                    src="/images/logos/jp-heritage-icon.png"
                                    alt="JP Heritage Bank Crest"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wider text-[#0D2545] uppercase">
                                    JP Heritage Bank, N.A.
                                </h1>
                                <p className="text-xs font-serif italic text-neutral-700 tracking-wide">
                                    Established 1888 • Private & Commercial Banking
                                </p>
                                <p className="text-[11px] text-neutral-600 mt-1">
                                    Corporate Headquarters: 100 Wall Street, 28th Floor, New York, NY 10005 • Tel: (800) 555-JPHB
                                </p>
                            </div>
                        </div>

                        <div className="text-right text-[11px] font-mono text-neutral-600 space-y-0.5 border-l-2 border-neutral-300 pl-4">
                            <div><strong>REGULATOR:</strong> OCC / FED</div>
                            <div><strong>FDIC CERTIFICATE:</strong> #18880</div>
                            <div><strong>ROUTING (ABA):</strong> 021000089</div>
                            <div><strong>SECURITY:</strong> 256-BIT ENCRYPTED</div>
                        </div>
                    </div>

                    {/* Official Document Title */}
                    <div className="text-center py-6">
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-900 tracking-wide uppercase">
                            Customer Identification Program (CIP) & Account Opening Application
                        </h2>
                        <p className="text-xs text-neutral-600 uppercase tracking-wider font-semibold mt-1">
                            Official Paper Application for Individual / Personal Deposit Accounts
                        </p>
                    </div>

                    {/* Official Notice / Warning Box */}
                    <div className="p-4 bg-amber-50/70 border border-amber-300/80 text-[11px] text-neutral-800 leading-relaxed font-sans">
                        <strong className="block text-amber-900 uppercase font-bold mb-1">
                            Important Information About Procedures for Opening a New Account:
                        </strong>
                        To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account. What this means for you: When you open an account, we will ask for your name, address, date of birth, and other information that will allow us to identify you. We will also ask to see your driver's license or other identifying documents.
                    </div>

                    {/* Pre-Approval Dossier Box */}
                    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-neutral-100 border border-neutral-300 text-xs font-mono">
                        <div>
                            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Registration Token:</span>
                            <span className="font-bold text-[#0D2545]">{application.registrationToken.substring(0, 14)}...</span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Applicant Name:</span>
                            <span className="font-bold text-neutral-900">{application.firstName} {application.lastName}</span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Desired Account:</span>
                            <span className="font-bold text-neutral-900">{application.desiredAccountType || 'Everyday Checking'}</span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Pre-Approval Status:</span>
                            <span className="font-bold text-emerald-700">APPROVED FOR CIP</span>
                        </div>
                    </div>
                </div>

                {errors.submit && (
                    <div className="p-4 bg-red-100 border-b border-red-300 text-red-800 text-center font-bold text-sm">
                        {errors.submit}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 1: APPLICANT IDENTIFICATION (KYC) */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 border-b border-neutral-300">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 1: Applicant Identification (Primary Account Holder)
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">USA PATRIOT ACT § 326</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Full Legal Name (Must match government ID) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.fullLegalName ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.fullLegalName}
                                onChange={(e) => updateField('fullLegalName', e.target.value)}
                            />
                            {errors.fullLegalName && <p className="text-xs text-red-600 mt-1 font-bold">{errors.fullLegalName}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Date of Birth <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.dateOfBirth ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.dateOfBirth}
                                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                            />
                            {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1 font-bold">{errors.dateOfBirth}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Social Security Number (SSN) or ITIN <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="XXX-XX-XXXX"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.ssnItin ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.ssnItin}
                                onChange={(e) => updateField('ssnItin', e.target.value)}
                            />
                            {errors.ssnItin && <p className="text-xs text-red-600 mt-1 font-bold">{errors.ssnItin}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Mother's Maiden Name (Security Verification) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.mothersMaidenName ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.mothersMaidenName}
                                onChange={(e) => updateField('mothersMaidenName', e.target.value)}
                            />
                            {errors.mothersMaidenName && <p className="text-xs text-red-600 mt-1 font-bold">{errors.mothersMaidenName}</p>}
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 2: CONTACT & RESIDENTIAL DETAILS */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 border-b border-neutral-300 bg-neutral-50/40">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 2: Contact & Residential Details
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">NO P.O. BOXES PERMITTED</span>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Physical Residential Address (Street, Apt/Suite, City, State, ZIP) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="123 Financial Way, Suite 400, New York, NY 10005"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.residentialAddress ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.residentialAddress}
                                onChange={(e) => updateField('residentialAddress', e.target.value)}
                            />
                            {errors.residentialAddress && <p className="text-xs text-red-600 mt-1 font-bold">{errors.residentialAddress}</p>}
                        </div>

                        <div className="p-4 bg-white border border-neutral-300">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded-none border-2 border-neutral-700 text-[#0D2545] focus:ring-0"
                                    checked={formData.isMailingSame}
                                    onChange={(e) => updateField('isMailingSame', e.target.checked)}
                                />
                                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                                    Mailing Address is identical to Physical Residential Address
                                </span>
                            </label>

                            {!formData.isMailingSame && (
                                <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                        Mailing Address (P.O. Box acceptable for mailing only) <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.mailingAddress ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                        value={formData.mailingAddress}
                                        onChange={(e) => updateField('mailingAddress', e.target.value)}
                                    />
                                    {errors.mailingAddress && <p className="text-xs text-red-600 mt-1 font-bold">{errors.mailingAddress}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                    Primary Phone Number Type
                                </label>
                                <select
                                    className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none focus:bg-white focus:border-[#0D2545]"
                                    value={formData.primaryPhoneType}
                                    onChange={(e) => updateField('primaryPhoneType', e.target.value)}
                                >
                                    <option value="Mobile">Mobile (SMS-Enabled)</option>
                                    <option value="Home">Home Landline</option>
                                    <option value="Work">Business / Work Line</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                    Registered Phone Number
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full px-3 py-2.5 bg-neutral-200/70 border border-neutral-300 text-neutral-600 font-mono text-sm rounded-none cursor-not-allowed"
                                    value={application.phone || 'Inherited from preliminary dossier'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 3: OCCUPATION, EMPLOYMENT & SOURCE OF WEALTH */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 border-b border-neutral-300">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 3: Occupation, Employment & Source of Wealth
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">BSA / AML COMPLIANCE</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Employment Status <span className="text-red-600">*</span>
                            </label>
                            <select
                                className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none focus:bg-white focus:border-[#0D2545]"
                                value={formData.employmentStatus}
                                onChange={(e) => updateField('employmentStatus', e.target.value)}
                            >
                                <option value="Employed">Employed (Full-Time / Part-Time)</option>
                                <option value="Self-Employed">Self-Employed / Business Owner</option>
                                <option value="Retired">Retired</option>
                                <option value="Student">Student</option>
                                <option value="Unemployed">Not Currently Employed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Occupation / Professional Title <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Managing Director, Consultant, Physician"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.occupation ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.occupation}
                                onChange={(e) => updateField('occupation', e.target.value)}
                            />
                            {errors.occupation && <p className="text-xs text-red-600 mt-1 font-bold">{errors.occupation}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Employer / Company Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Morgan Capital Partners LLC"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.employerName ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.employerName}
                                onChange={(e) => updateField('employerName', e.target.value)}
                            />
                            {errors.employerName && <p className="text-xs text-red-600 mt-1 font-bold">{errors.employerName}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Primary Source of Account Funds
                            </label>
                            <select
                                className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none focus:bg-white focus:border-[#0D2545]"
                                value={formData.primarySourceOfFunds}
                                onChange={(e) => updateField('primarySourceOfFunds', e.target.value)}
                            >
                                <option value="Salary/Wages">Salary / Employment Compensation</option>
                                <option value="Investments">Investments / Capital Gains</option>
                                <option value="Business Profits">Business Ownership / Distributions</option>
                                <option value="Inheritance">Inheritance / Trust Distribution</option>
                                <option value="Savings">Accumulated Personal Savings</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Estimated Annual Household Income (USD)
                            </label>
                            <select
                                className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none focus:bg-white focus:border-[#0D2545]"
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
                </div>

                {/* ========================================================================= */}
                {/* SECTION 4: GOVERNMENT-ISSUED IDENTIFICATION DOCUMENTS */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 border-b border-neutral-300 bg-neutral-50/40">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 4: Government-Issued Identification Documents
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">PHOTO ID REQUIRED</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Primary ID Type <span className="text-red-600">*</span>
                            </label>
                            <select
                                className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none focus:bg-white focus:border-[#0D2545]"
                                value={formData.primaryIdType}
                                onChange={(e) => updateField('primaryIdType', e.target.value)}
                            >
                                <option value="Driver's License">Driver's License (State-Issued)</option>
                                <option value="State ID">State Identification Card</option>
                                <option value="Passport">U.S. / International Passport</option>
                                <option value="Permanent Resident Card">Permanent Resident Card (Form I-551)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Document ID Number <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.idNumber ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.idNumber}
                                onChange={(e) => updateField('idNumber', e.target.value)}
                            />
                            {errors.idNumber && <p className="text-xs text-red-600 mt-1 font-bold">{errors.idNumber}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                State or Country of Issuance <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. New York, USA"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.stateCountryOfIssuance ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.stateCountryOfIssuance}
                                onChange={(e) => updateField('stateCountryOfIssuance', e.target.value)}
                            />
                            {errors.stateCountryOfIssuance && <p className="text-xs text-red-600 mt-1 font-bold">{errors.stateCountryOfIssuance}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                    Issue Date <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.issueDate ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                    value={formData.issueDate}
                                    onChange={(e) => updateField('issueDate', e.target.value)}
                                />
                                {errors.issueDate && <p className="text-xs text-red-600 mt-1 font-bold">{errors.issueDate}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                    Expiration Date <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.expirationDate ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                    value={formData.expirationDate}
                                    onChange={(e) => updateField('expirationDate', e.target.value)}
                                />
                                {errors.expirationDate && <p className="text-xs text-red-600 mt-1 font-bold">{errors.expirationDate}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ID Document Uploads */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="border-2 border-dashed border-neutral-300 p-5 bg-white text-center">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 mb-1">
                                Document Photo (Front)
                            </h4>
                            <p className="text-[11px] text-neutral-500 mb-3">Clear photo of government-issued ID front</p>
                            {formData.idFrontDocumentUrl ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Front Document Uploaded</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => idFrontInputRef.current?.click()}
                                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold uppercase tracking-wider border border-neutral-300 inline-flex items-center gap-2"
                                >
                                    <Upload className="w-3.5 h-3.5" /> Select File / Photo
                                </button>
                            )}
                        </div>

                        <div className="border-2 border-dashed border-neutral-300 p-5 bg-white text-center">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 mb-1">
                                Document Photo (Back)
                            </h4>
                            <p className="text-[11px] text-neutral-500 mb-3">Clear photo of government-issued ID barcode/back</p>
                            {formData.idBackDocumentUrl ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Back Document Uploaded</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => idBackInputRef.current?.click()}
                                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold uppercase tracking-wider border border-neutral-300 inline-flex items-center gap-2"
                                >
                                    <Upload className="w-3.5 h-3.5" /> Select File / Photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 5: ACCOUNT CONFIGURATION & PREFERENCES */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 border-b border-neutral-300">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 5: Account Configuration & Preferences
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">SERVICE OPTIONS</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 bg-neutral-50 border border-neutral-300">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 w-4 h-4 rounded-none border-2 border-neutral-700 text-[#0D2545] focus:ring-0"
                                    checked={formData.overdraftProtection}
                                    onChange={(e) => updateField('overdraftProtection', e.target.checked)}
                                />
                                <div>
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide block">
                                        Opt-In to Standard Overdraft Protection
                                    </span>
                                    <p className="text-[11px] text-neutral-600 mt-0.5">
                                        Authorizes discretionary coverage for ATM and everyday debit transactions.
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-neutral-200">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 w-4 h-4 rounded-none border-2 border-neutral-700 text-[#0D2545] focus:ring-0"
                                    checked={formData.debitCardRequest}
                                    onChange={(e) => updateField('debitCardRequest', e.target.checked)}
                                />
                                <div>
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide block">
                                        Issue Contactless Visa® Debit Card
                                    </span>
                                    <p className="text-[11px] text-neutral-600 mt-0.5">
                                        Card will be personalized and mailed to your residential address.
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            {formData.debitCardRequest && (
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                        Card Embossing Name (Max 26 Characters)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={26}
                                        className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none uppercase focus:bg-white focus:border-[#0D2545]"
                                        value={formData.nameToAppearOnCard}
                                        onChange={(e) => updateField('nameToAppearOnCard', e.target.value.toUpperCase())}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                    Statement Delivery Preference
                                </label>
                                <select
                                    className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none focus:bg-white focus:border-[#0D2545]"
                                    value={formData.statementPreference}
                                    onChange={(e) => updateField('statementPreference', e.target.value)}
                                >
                                    <option value="E-Statements">Electronic Statements (Secure Online PDF, No Fee)</option>
                                    <option value="Paper Statements">Paper Mailed Statements ($5.00 Monthly Paper Fee)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 6: INITIAL ACCOUNT FUNDING & REMITTANCE */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 border-b border-neutral-300 bg-neutral-50/40">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 6: Initial Account Funding & Remittance
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">REGULATION CC COMPLIANT</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Initial Deposit Funding Method <span className="text-red-600">*</span>
                            </label>
                            <select
                                className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#94A3B8] text-neutral-900 font-mono text-sm outline-none rounded-none focus:bg-white focus:border-[#0D2545]"
                                value={formData.fundingMethod}
                                onChange={(e) => updateField('fundingMethod', e.target.value)}
                            >
                                <option value="External Bank Transfer (ACH)">External Bank Transfer (ACH Debit)</option>
                                <option value="Wire Transfer">Incoming Domestic / International Wire</option>
                                <option value="Mobile Check Deposit">Mobile Check Deposit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                Initial Deposit Amount ($ USD) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="500.00"
                                className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.initialDepositAmount ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                value={formData.initialDepositAmount}
                                onChange={(e) => updateField('initialDepositAmount', e.target.value)}
                            />
                            {errors.initialDepositAmount && <p className="text-xs text-red-600 mt-1 font-bold">{errors.initialDepositAmount}</p>}
                        </div>

                        {formData.fundingMethod === 'External Bank Transfer (ACH)' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                        External Bank 9-Digit Routing Number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={9}
                                        placeholder="XXXXXXXXX"
                                        className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.externalAccountRoutingNumber ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                        value={formData.externalAccountRoutingNumber}
                                        onChange={(e) => updateField('externalAccountRoutingNumber', e.target.value)}
                                    />
                                    {errors.externalAccountRoutingNumber && <p className="text-xs text-red-600 mt-1 font-bold">{errors.externalAccountRoutingNumber}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                        External Bank Account Number <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="XXXXXXXXXXXX"
                                        className={`w-full px-3 py-2.5 bg-[#F1F5F9] border ${errors.externalAccountNumber ? 'border-red-600 bg-red-50' : 'border-[#94A3B8] focus:border-[#0D2545] focus:bg-white'} text-neutral-900 font-mono text-sm outline-none transition-colors rounded-none`}
                                        value={formData.externalAccountNumber}
                                        onChange={(e) => updateField('externalAccountNumber', e.target.value)}
                                    />
                                    {errors.externalAccountNumber && <p className="text-xs text-red-600 mt-1 font-bold">{errors.externalAccountNumber}</p>}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 7: TAXPAYER IDENTIFICATION (W-9) & REGULATORY DISCLOSURES */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 border-b border-neutral-300">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 7: Taxpayer Identification (W-9) & Legal Certifications
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">INTERNAL REVENUE CODE</span>
                    </div>

                    <div className="space-y-4 p-5 bg-neutral-50 border border-neutral-300 text-xs leading-relaxed text-neutral-800">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 rounded-none border-2 border-neutral-700 text-[#0D2545] focus:ring-0"
                                checked={formData.w9Certification}
                                onChange={(e) => updateField('w9Certification', e.target.checked)}
                            />
                            <div>
                                <span className="font-bold uppercase tracking-wide block text-neutral-900">
                                    W-9 Certification Under Penalties of Perjury <span className="text-red-600">*</span>
                                </span>
                                <p className="text-[11px] text-neutral-600 mt-0.5">
                                    Under penalties of perjury, I certify that: (1) The number shown on this form is my correct taxpayer identification number; (2) I am not subject to backup withholding; and (3) I am a U.S. citizen or other U.S. person.
                                </p>
                                {errors.w9Certification && <p className="text-xs text-red-600 font-bold mt-1">{errors.w9Certification}</p>}
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-neutral-200">
                            <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 rounded-none border-2 border-neutral-700 text-[#0D2545] focus:ring-0"
                                checked={formData.electronicCommunicationsDisclosure}
                                onChange={(e) => updateField('electronicCommunicationsDisclosure', e.target.checked)}
                            />
                            <div>
                                <span className="font-bold uppercase tracking-wide block text-neutral-900">
                                    Electronic Communications & Records Disclosure Consent <span className="text-red-600">*</span>
                                </span>
                                <p className="text-[11px] text-neutral-600 mt-0.5">
                                    I consent to receive all notices, disclosures, tax statements, and account documentation electronically in compliance with the federal E-SIGN Act.
                                </p>
                                {errors.electronicCommunicationsDisclosure && <p className="text-xs text-red-600 font-bold mt-1">{errors.electronicCommunicationsDisclosure}</p>}
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-neutral-200">
                            <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 rounded-none border-2 border-neutral-700 text-[#0D2545] focus:ring-0"
                                checked={formData.depositAccountAgreement}
                                onChange={(e) => updateField('depositAccountAgreement', e.target.checked)}
                            />
                            <div>
                                <span className="font-bold uppercase tracking-wide block text-neutral-900">
                                    Deposit Account Agreement & Truth in Savings Acknowledgment <span className="text-red-600">*</span>
                                </span>
                                <p className="text-[11px] text-neutral-600 mt-0.5">
                                    I have received, read, and agree to be bound by the JP Heritage Bank Deposit Account Agreement, Fee Schedule, and Funds Availability Policy.
                                </p>
                                {errors.depositAccountAgreement && <p className="text-xs text-red-600 font-bold mt-1">{errors.depositAccountAgreement}</p>}
                            </div>
                        </label>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 8: DIGITAL SIGNATURE & EXECUTION */}
                {/* ========================================================================= */}
                <div className="p-6 md:p-10 bg-white">
                    <div className="bg-[#0D2545] text-white px-4 py-2 mb-6 flex items-center justify-between border-l-4 border-[#B8960C]">
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Section 8: Digital Signature & Execution
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300">FEDERAL E-SIGN ACT</span>
                    </div>

                    <p className="text-xs text-neutral-700 mb-6 leading-relaxed">
                        To execute this application, please provide your official signature. You may either <strong>snap a photo of your signature with your device camera</strong>, or <strong>upload an image/PDF of your signature</strong> from your photo app or file manager.
                    </p>

                    {/* Two Working Buttons */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {/* Button 1: Snap Signature (Camera) */}
                        <button
                            type="button"
                            onClick={openCamera}
                            className="w-full py-3.5 px-5 bg-[#0D2545] text-white hover:bg-[#1B355B] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2.5 border border-[#0D2545] shadow-sm active:translate-y-0.5"
                        >
                            <Camera className="w-4 h-4 text-amber-400" />
                            <span>1. Snap Signature (Camera)</span>
                        </button>

                        {/* Button 2: Upload Signature (PDF / PNG / JPEG) */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2.5 border border-neutral-400 shadow-sm active:translate-y-0.5"
                        >
                            <Upload className="w-4 h-4 text-[#0D2545]" />
                            <span>2. Upload Signature (PDF / PNG / JPEG)</span>
                        </button>
                    </div>

                    {/* Paper Document Signature Block */}
                    <div className={`p-6 border-2 ${errors.digitalSignature ? 'border-red-600 bg-red-50/50' : 'border-neutral-400 bg-neutral-50/70'} relative transition-colors`}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            {/* Left: Signature Display / Baseline */}
                            <div className="flex-1">
                                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block mb-2">
                                    Authorized Applicant Signature Block
                                </span>

                                {signaturePreview ? (
                                    <div className="space-y-3">
                                        {signatureFileType === 'image' ? (
                                            <div className="p-3 bg-white border border-neutral-300 inline-block">
                                                <img 
                                                    src={signaturePreview} 
                                                    alt="Captured Signature" 
                                                    className="max-h-24 max-w-xs object-contain" 
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-white border border-neutral-300 flex items-center gap-3 max-w-sm">
                                                <FileText className="w-8 h-8 text-red-600 shrink-0" />
                                                <div className="truncate">
                                                    <span className="font-bold text-xs text-neutral-900 block truncate">{signatureFileName}</span>
                                                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">PDF Signature Attached</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={clearSignature}
                                                className="text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove / Clear
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 border-b-2 border-neutral-800 flex items-end justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-serif font-black text-2xl text-neutral-900">X</span>
                                            <span className="text-xs font-mono text-neutral-500 italic">
                                                (No signature attached yet — use buttons above to snap or upload)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="text-[11px] font-mono text-neutral-600 mt-2">
                                    PRIMARY APPLICANT: <strong>{formData.fullLegalName || application.firstName + ' ' + application.lastName}</strong>
                                </div>
                            </div>

                            {/* Right: Date of Execution */}
                            <div className="md:w-48">
                                <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase mb-1">
                                    Date of Execution:
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full px-3 py-2 bg-neutral-200/80 border border-neutral-400 text-neutral-800 font-mono text-xs rounded-none"
                                    value={formData.signatureDate}
                                />
                            </div>
                        </div>

                        {errors.digitalSignature && (
                            <p className="text-xs text-red-600 font-bold mt-4">
                                {errors.digitalSignature}
                            </p>
                        )}
                    </div>

                    {/* Final Submission Button */}
                    <div className="mt-10 pt-6 border-t-2 border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>This document is transmitted with 256-bit bank grade encryption under federal oversight.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-10 py-4 bg-[#0D2545] hover:bg-[#1B355B] text-white font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg active:translate-y-0.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Processing & Transmitting...</span>
                                </>
                            ) : (
                                <span>Submit Official CIP Application</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}
