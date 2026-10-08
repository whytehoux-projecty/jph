'use client';

import { useState, useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, ArrowRight, User, Building2, Check, Globe2, Loader2 } from 'lucide-react';

import { Button } from '@/components/commercial-ui/Button';
import { requestAccountOpening, validatePostalCode } from '@/app/(corporate)/actions';
import { BRAND } from '@/src/content/facts';
import {
    COUNTRY_LIST,
    GROUP_LABELS,
    PERSONAL_ACCOUNT_TYPES,
    getCountryConfig,
    validateIdSelection,
    validatePhone,
    type IdGroup,
} from '@/lib/countries/config';

const inputCls = (err?: string) =>
    `vault-input h-[52px] w-full rounded-md border bg-white px-4 text-base outline-none transition focus:border-ink-900 focus:ring-2 focus:ring-[#C8401A]/30 ${err ? 'border-[#C8401A]' : 'border-[#CFC8B8]'}`;

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-small font-medium text-ink-900">{label}</label>
            {children}
            {error ? <p className="text-xs text-vermilion-600" role="alert">{error}</p> : hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
        </div>
    );
}

const TOTAL_STEPS = 3;
const STEP_TITLES = ['Country, Account & ID', 'Name & Address', 'Contact & Consent'];

export function ApplicationWizard() {
    const searchParams = useSearchParams();
    const isSubmitted = searchParams.get('submitted') === 'true';
    const referenceId = searchParams.get('ref') || '';

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingPostal, startPostalCheck] = useTransition();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [postalVerified, setPostalVerified] = useState(false);

    const [formData, setFormData] = useState({
        country: '',
        applicationType: 'PERSONAL' as 'PERSONAL' | 'BUSINESS',
        idTypesHeld: [] as string[],
        desiredAccountType: '' as '' | 'SAVINGS' | 'CHECKING',
        firstName: '', middleName: '', lastName: '',
        address: '', city: '', state: '', zipCode: '',
        phone: '', email: '',
        consentTerms: false, consentPrivacy: false, consentComms: false,
        businessName: '', entityType: '', stateOfFormation: '', ein: '', industry: '', website: '',
    });

    const country = useMemo(() => getCountryConfig(formData.country), [formData.country]);
    const isBusiness = formData.applicationType === 'BUSINESS';

    const clearError = (field: string) =>
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        clearError(field);
        if (field === 'zipCode') setPostalVerified(false);
    };

    const changeCountry = (code: string) => {
        setFormData((prev) => ({ ...prev, country: code, idTypesHeld: [], state: '', zipCode: '', phone: '', entityType: '' }));
        setPostalVerified(false);
        setErrors({});
    };

    const toggleId = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            idTypesHeld: prev.idTypesHeld.includes(id) ? prev.idTypesHeld.filter((x) => x !== id) : [...prev.idTypesHeld, id],
        }));
        clearError('idTypesHeld');
    };

    const checkPostal = async (): Promise<boolean> => {
        const res = await validatePostalCode(formData.country, formData.zipCode);
        if (!res.valid) {
            setErrors((prev) => ({ ...prev, zipCode: res.message }));
            return false;
        }
        setPostalVerified(res.verified);
        setFormData((prev) => ({
            ...prev,
            city: prev.city || res.city || '',
            state: prev.state || (country?.regions?.includes(res.state || '') ? res.state! : ''),
        }));
        return true;
    };

    const validateStep = async (): Promise<boolean> => {
        const e: Record<string, string> = {};
        if (step === 1) {
            if (!country) e.country = 'Select your country of residence';
            else {
                const idErr = validateIdSelection(country, formData.idTypesHeld);
                if (idErr) e.idTypesHeld = idErr;
            }
            if (!isBusiness && !formData.desiredAccountType) e.desiredAccountType = 'Select an account type';
        }
        if (step === 2 && country) {
            if (!formData.firstName.trim()) e.firstName = 'First name is required';
            if (!formData.lastName.trim()) e.lastName = 'Last name is required';
            if (!formData.address.trim()) e.address = 'Street address is required';
            if (!formData.city.trim()) e.city = 'City is required';
            if (!formData.state.trim()) e.state = `${country.regionLabel} is required`;
            if (!formData.zipCode.trim()) e.zipCode = `${country.postal.label} is required`;
            if (isBusiness) {
                if (!formData.businessName.trim()) e.businessName = 'Business name is required';
                if (!formData.entityType) e.entityType = 'Entity type is required';
                if (!formData.ein.trim()) e.ein = `${country.businessTaxIdLabel} is required`;
                else if (country.businessTaxIdPattern && !country.businessTaxIdPattern.test(formData.ein.trim())) e.ein = `Invalid ${country.businessTaxIdLabel}`;
                if (!formData.industry.trim()) e.industry = 'Industry is required';
            }
            if (!e.zipCode && !postalVerified) {
                const ok = await checkPostal();
                if (!ok) return false;
            }
        }
        if (step === 3 && country) {
            if (!formData.phone.trim()) e.phone = 'Phone number is required';
            else if (!validatePhone(country, formData.phone)) e.phone = `Invalid number. ${country.phone.hint}`;
            if (!formData.email.trim()) e.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) e.email = 'Enter a valid email address';
            if (!formData.consentTerms) e.consentTerms = 'You must accept the Terms and Conditions';
            if (!formData.consentPrivacy) e.consentPrivacy = 'You must accept the Privacy Policy';
            if (!formData.consentComms) e.consentComms = 'You must give your consent to proceed';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = async () => {
        if (!(await validateStep())) return;
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => setStep((s) => s - 1);

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (step < TOTAL_STEPS) {
            await nextStep();
            return;
        }
        if (!(await validateStep())) return;
        setIsSubmitting(true);
        try {
            const res = await requestAccountOpening(formData);
            window.location.href = `/apply?submitted=true&ref=${res.referenceId}`;
        } catch (error) {
            console.error('Application error:', error);
            setErrors({ submit: 'Failed to submit request. Please check your details and try again.' });
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto bg-paper-100 flex items-center justify-center">
                <div className="max-w-xl w-full">
                    <div className="bg-white p-10 rounded-md border border-[#CFC8B8] shadow-sm text-center">
                        <div className="w-48 h-48 mx-auto mb-6 overflow-hidden">
                            <iframe src="/assets/apply/success-submit.html" className="w-full h-full border-none" title="Success" />
                        </div>
                        <h2 className="font-display text-h2 text-ink-900 mb-2">Application Received</h2>
                        <p className="text-body-lg text-ink-700 mb-8">
                            Thank you for applying to {BRAND.legalName}. Your request has been securely routed to our onboarding team.
                        </p>
                        <div className="bg-paper-100 p-6 rounded border border-paper-200 mb-8 text-left">
                            <p className="label-mono text-ink-500 mb-1">Reference ID</p>
                            <p className="font-mono text-xl font-medium text-ink-900 mb-6">{referenceId}</p>
                            <p className="label-mono text-ink-500 mb-1">Next steps</p>
                            <ul className="space-y-3">
                                {['We will review your preliminary application within 1 business day.', 'If eligible, you will receive a secure registration link via email.', 'Complete the full KYC profile to open your account.'].map((t, i) => (
                                    <li key={i} className="flex items-start gap-3 text-body text-ink-700">
                                        <span className="font-medium text-ink-900 shrink-0">{i + 1}.</span>
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button as="a" href="/" variant="secondary" className="w-full">Return to homepage</Button>
                    </div>
                </div>
            </div>
        );
    }

    const slide = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, className: 'space-y-6' };
    const groups: IdGroup[] = ['primary', 'taxId', 'address'];

    return (
        <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto bg-paper-100" style={{ backgroundImage: "url('/assets/apply/apply-right-texture.jpg')" }}>
            <div className="relative max-w-xl mx-auto">
                <div className="mb-10 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <p className="label-mono text-vermilion-600">Step {step} of {TOTAL_STEPS}</p>
                        <p className="text-small text-ink-500 font-medium">{STEP_TITLES[step - 1]}</p>
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: `@keyframes glint { 0% { left: -100%; } 100% { left: 200%; } }` }} />
                    <div className="w-full h-2 bg-[#E4DDCC] rounded-full overflow-hidden relative flex">
                        <div className="h-full bg-[#DB4429] rounded-full transition-all duration-500 ease-out relative overflow-hidden group" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}>
                            <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'glint 1s ease-out infinite' }} />
                        </div>
                    </div>
                </div>

                <div className="absolute -top-16 -right-16 w-64 h-64 z-0 pointer-events-none opacity-80 hidden md:block">
                    <img src="/assets/apply/apply-card-accent.jpg" alt="" className="w-full h-full mix-blend-multiply" />
                </div>

                <form onSubmit={handleSubmit} noValidate className="relative z-10 bg-white p-8 rounded-md border border-[#CFC8B8] shadow-sm overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" {...slide}>
                                <div>
                                    <h2 className="font-display text-h3 text-ink-900 mb-1">Let&apos;s get started</h2>
                                    <p className="text-body text-ink-700">Your answers tailor the form to your country.</p>
                                </div>

                                <Field id="country" label="Where are you from? (Country of residence)" error={errors.country}>
                                    <div className="relative">
                                        <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" aria-hidden="true" />
                                        <select id="country" value={formData.country} onChange={(e) => changeCountry(e.target.value)} className={`${inputCls(errors.country)} pl-10`}>
                                            <option value="">Select your country</option>
                                            {COUNTRY_LIST.map((c) => (
                                                <option key={c.code} value={c.code}>{c.flag}  {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </Field>

                                <div className="space-y-1.5">
                                    <span className="block text-small font-medium text-ink-900">Type of account</span>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(['PERSONAL', 'BUSINESS'] as const).map((t) => {
                                            const active = formData.applicationType === t;
                                            const Icon = t === 'PERSONAL' ? User : Building2;
                                            return (
                                                <button key={t} type="button" onClick={() => updateField('applicationType', t)} aria-pressed={active}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-md border transition-colors ${active ? 'bg-ink-900 border-ink-900 text-white' : 'bg-white border-[#CFC8B8] text-ink-900 hover:border-ink-900'}`}>
                                                    <Icon className={`w-6 h-6 mb-2 ${active ? 'text-paper-50' : 'text-ink-500'}`} />
                                                    <span className="font-medium text-small">{t === 'PERSONAL' ? 'Personal' : 'Business'}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {country && (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="block text-small font-medium text-ink-900">Which of these valid IDs do you have?</span>
                                            <p className="text-xs text-ink-500">Select all that apply for {country.name}. You will upload them later.</p>
                                        </div>
                                        {groups.map((g) => {
                                            const opts = country.idOptions.filter((o) => o.group === g);
                                            if (!opts.length) return null;
                                            return (
                                                <fieldset key={g} className="space-y-2">
                                                    <legend className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-1">{GROUP_LABELS[g].title}</legend>
                                                    {opts.map((o) => {
                                                        const checked = formData.idTypesHeld.includes(o.id);
                                                        return (
                                                            <label key={o.id} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${checked ? 'border-ink-900 bg-paper-100' : 'border-paper-300 hover:border-ink-700'}`}>
                                                                <input type="checkbox" checked={checked} onChange={() => toggleId(o.id)} className="sr-only" />
                                                                <span className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center ${checked ? 'bg-ink-900 border-ink-900' : 'border-[#CFC8B8] bg-white'}`} aria-hidden="true">
                                                                    {checked && <Check className="w-3.5 h-3.5 text-paper-50" />}
                                                                </span>
                                                                <span>
                                                                    <span className="block text-small font-medium text-ink-900">{o.label}</span>
                                                                    <span className="block text-xs text-ink-500">{o.description}</span>
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </fieldset>
                                            );
                                        })}
                                        {errors.idTypesHeld && <p className="text-xs text-vermilion-600" role="alert">{errors.idTypesHeld}</p>}
                                    </div>
                                )}

                                {country && !isBusiness && (
                                    <div className="space-y-1.5">
                                        <span className="block text-small font-medium text-ink-900">Select the type of personal account you want</span>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {PERSONAL_ACCOUNT_TYPES.map((a) => {
                                                const active = formData.desiredAccountType === a.value;
                                                return (
                                                    <button key={a.value} type="button" onClick={() => updateField('desiredAccountType', a.value)} aria-pressed={active}
                                                        className={`text-left p-4 rounded-md border transition-colors ${active ? 'bg-ink-900 border-ink-900 text-white' : 'bg-white border-[#CFC8B8] text-ink-900 hover:border-ink-900'}`}>
                                                        <span className="block font-medium text-small">{a.label}</span>
                                                        <span className={`block text-xs mt-1 ${active ? 'text-paper-300' : 'text-ink-500'}`}>{a.description}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.desiredAccountType && <p className="text-xs text-vermilion-600" role="alert">{errors.desiredAccountType}</p>}
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end">
                                    <Button onClick={nextStep} variant="primary">Next <ArrowRight className="w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && country && (
                            <motion.div key="step2" {...slide}>
                                <div>
                                    <h2 className="font-display text-h3 text-ink-900 mb-1">{isBusiness ? 'Business & representative details' : 'Your name and address'}</h2>
                                    <p className="text-body text-ink-700">Enter your details exactly as shown on your ID.</p>
                                </div>

                                {isBusiness && (
                                    <div className="space-y-4 pb-4 border-b border-paper-200">
                                        <Field id="businessName" label="Legal business name" error={errors.businessName}>
                                            <input id="businessName" value={formData.businessName} onChange={(e) => updateField('businessName', e.target.value)} className={inputCls(errors.businessName)} />
                                        </Field>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Field id="entityType" label="Entity type" error={errors.entityType}>
                                                <select id="entityType" value={formData.entityType} onChange={(e) => updateField('entityType', e.target.value)} className={inputCls(errors.entityType)}>
                                                    <option value="">Select entity type</option>
                                                    {country.entityTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                </select>
                                            </Field>
                                            <Field id="ein" label={country.businessTaxIdLabel} error={errors.ein}>
                                                <input id="ein" value={formData.ein} onChange={(e) => updateField('ein', e.target.value)} className={inputCls(errors.ein)} />
                                            </Field>
                                            <Field id="industry" label="Industry" error={errors.industry}>
                                                <input id="industry" value={formData.industry} onChange={(e) => updateField('industry', e.target.value)} className={inputCls(errors.industry)} />
                                            </Field>
                                            <Field id="website" label="Website (optional)">
                                                <input id="website" type="url" value={formData.website} onChange={(e) => updateField('website', e.target.value)} className={inputCls()} />
                                            </Field>
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-3 gap-4">
                                    <Field id="firstName" label="First name" error={errors.firstName}>
                                        <input id="firstName" autoComplete="given-name" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={inputCls(errors.firstName)} />
                                    </Field>
                                    <Field id="middleName" label="Middle name">
                                        <input id="middleName" autoComplete="additional-name" value={formData.middleName} onChange={(e) => updateField('middleName', e.target.value)} className={inputCls()} />
                                    </Field>
                                    <Field id="lastName" label="Last name" error={errors.lastName}>
                                        <input id="lastName" autoComplete="family-name" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={inputCls(errors.lastName)} />
                                    </Field>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-small font-medium text-ink-900">Living address in {country.name}</p>
                                    <Field id="address" label="Address" error={errors.address}>
                                        <input id="address" autoComplete="street-address" value={formData.address} onChange={(e) => updateField('address', e.target.value)} className={inputCls(errors.address)} />
                                    </Field>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Field id="zipCode" label={country.postal.label} error={errors.zipCode} hint={postalVerified ? '✓ Verified' : country.postal.hint}>
                                            <div className="relative">
                                                <input id="zipCode" autoComplete="postal-code" placeholder={country.postal.placeholder} value={formData.zipCode}
                                                    onChange={(e) => updateField('zipCode', e.target.value)}
                                                    onBlur={() => { if (formData.zipCode.trim()) startPostalCheck(async () => { await checkPostal(); }); }}
                                                    className={inputCls(errors.zipCode)} />
                                                {checkingPostal && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-ink-500" aria-hidden="true" />}
                                            </div>
                                        </Field>
                                        <Field id="city" label="City" error={errors.city}>
                                            <input id="city" autoComplete="address-level2" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={inputCls(errors.city)} />
                                        </Field>
                                    </div>
                                    <Field id="state" label={country.regionLabel} error={errors.state}>
                                        {country.regions ? (
                                            <select id="state" value={formData.state} onChange={(e) => updateField('state', e.target.value)} className={inputCls(errors.state)}>
                                                <option value="">Select {country.regionLabel.toLowerCase()}</option>
                                                {country.regions.map((r) => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        ) : (
                                            <input id="state" value={formData.state} onChange={(e) => updateField('state', e.target.value)} className={inputCls(errors.state)} />
                                        )}
                                    </Field>
                                </div>

                                <div className="pt-2 flex justify-between">
                                    <Button onClick={prevStep} variant="secondary">Back</Button>
                                    <Button onClick={nextStep} variant="primary" loading={checkingPostal}>Next <ArrowRight className="w-4 h-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && country && (
                            <motion.div key="step3" {...slide}>
                                <div>
                                    <h2 className="font-display text-h3 text-ink-900 mb-1">Contact &amp; consent</h2>
                                    <p className="text-body text-ink-700">We will use these details to reach you about your application.</p>
                                </div>

                                {errors.submit && (
                                    <div className="p-4 bg-vermilion-600/10 text-vermilion-700 text-small rounded border border-vermilion-600/20" role="alert">{errors.submit}</div>
                                )}

                                <Field id="phone" label="Phone number" error={errors.phone} hint={country.phone.hint}>
                                    <div className="flex gap-2">
                                        {country.code !== 'OTHER' && (
                                            <span className="h-12 px-3 inline-flex items-center rounded border border-paper-300 bg-paper-100 text-body text-ink-700 shrink-0">{country.flag} {country.dialCode}</span>
                                        )}
                                        <input id="phone" type="tel" autoComplete="tel-national" placeholder={country.phone.placeholder} value={formData.phone}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                updateField('phone', country.phone.format ? country.phone.format(raw.replace(/\D/g, '')) : raw);
                                            }}
                                            className={inputCls(errors.phone)} />
                                    </div>
                                </Field>

                                <Field id="email" label="Email address" error={errors.email}>
                                    <input id="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputCls(errors.email)} />
                                </Field>

                                <div className="space-y-4 pt-4 border-t border-paper-200">
                                    {([
                                        ['consentTerms', <>I have read and agree to the <Link href="/terms" target="_blank" className="underline text-ink-900">Terms and Conditions</Link>.</>],
                                        ['consentPrivacy', <>I have read and agree to the <Link href="/privacy" target="_blank" className="underline text-ink-900">Privacy Policy</Link> and authorize {BRAND.legalName} to retain my information for preliminary screening.</>],
                                        ['consentComms', <>I consent to {BRAND.legalName} verifying my identity and contacting me about my application by email and phone.</>],
                                    ] as [keyof typeof formData, React.ReactNode][]).map(([key, text]) => (
                                        <label key={key} className="flex items-start gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={formData[key] as boolean} onChange={(e) => updateField(key, e.target.checked)}
                                                className={`w-5 h-5 rounded mt-0.5 cursor-pointer accent-ink-900 ${errors[key] ? 'border-[#C8401A]' : 'border-[#CFC8B8]'}`} />
                                            <div>
                                                <span className="text-small text-ink-700 block">{text}</span>
                                                {errors[key] && <p className="text-xs text-vermilion-600 mt-1" role="alert">{errors[key]}</p>}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="pt-2 flex justify-between">
                                    <Button onClick={prevStep} variant="secondary" disabled={isSubmitting}>Back</Button>
                                    <Button type="submit" variant="primary" loading={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
}
