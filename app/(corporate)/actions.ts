'use server'

import { prisma } from '@/lib/prisma'
import { encryptDeterministic } from '@/lib/encryption'
import {
    getCountryConfig,
    validateIdSelection,
    validatePhone,
    normalizePhone,
    validatePostalFormat,
} from '@/lib/countries/config'

export type PostalCheckResult =
    | { valid: true; city?: string; state?: string; verified: boolean }
    | { valid: false; message: string }

/**
 * Validates a postal code for a country: format first, then (where supported)
 * a lookup against a real postal-code dataset to reject non-existent codes.
 * Lookup failures (network, unsupported country) fail open to format-only validation.
 */
export async function validatePostalCode(countryCode: string, postalCode: string): Promise<PostalCheckResult> {
    const country = getCountryConfig(countryCode)
    if (!country) return { valid: false, message: 'Select your country first' }
    const code = (postalCode || '').trim()
    if (!validatePostalFormat(country, code)) {
        return { valid: false, message: `Invalid ${country.postal.label}. ${country.postal.hint}` }
    }
    const lookup = country.postal.lookupCode
    if (!lookup) return { valid: true, verified: false }

    // Zippopotam expects: US 5-digit, CA first 3 chars (FSA), others as-is
    let query = code
    if (country.code === 'US') query = code.slice(0, 5)
    if (country.code === 'CA') query = code.replace(/[\s-]/g, '').slice(0, 3).toUpperCase()

    try {
        const res = await fetch(`https://api.zippopotam.us/${lookup}/${encodeURIComponent(query)}`, {
            signal: AbortSignal.timeout(4000),
            cache: 'force-cache',
        })
        if (res.status === 404) {
            return { valid: false, message: `This ${country.postal.label} does not exist. Please check and try again.` }
        }
        if (!res.ok) return { valid: true, verified: false }
        const json = await res.json()
        const place = json?.places?.[0]
        return { valid: true, verified: true, city: place?.['place name'], state: place?.state }
    } catch {
        return { valid: true, verified: false }
    }
}

export async function requestAccountOpening(data: any) {
    try {
        const country = getCountryConfig(data.country)
        if (!country) throw new Error('Unsupported country')

        const idTypes: string[] = Array.isArray(data.idTypesHeld) ? data.idTypesHeld : []
        const validIds = idTypes.filter((id) => country.idOptions.some((o) => o.id === id))
        const idError = validateIdSelection(country, validIds)
        if (idError) throw new Error(idError)
        if (!validatePhone(country, data.phone)) throw new Error('Invalid phone number')
        if (!validatePostalFormat(country, data.zipCode)) throw new Error('Invalid postal code')
        if (!data.consentTerms || !data.consentPrivacy || !data.consentComms) throw new Error('All consents are required')

        const isBusiness = data.applicationType === 'BUSINESS'
        const referenceId = `HT-APP-${Math.floor(100000 + Math.random() * 900000)}`;
        const application = await prisma.accountApplication.create({
            data: {
                referenceId,
                applicationType: isBusiness ? 'BUSINESS' : 'PERSONAL',
                desiredAccountType: isBusiness ? 'CHECKING' : (data.desiredAccountType === 'SAVINGS' ? 'SAVINGS' : 'CHECKING'),
                isExistingCustomer: false,
                isUsCitizenOrResident: country.code === 'US',
                consentComms: !!data.consentComms,
                consentPrivacy: !!data.consentPrivacy,
                consentTerms: !!data.consentTerms,
                country: country.code,
                idTypesHeld: JSON.stringify(validIds),
                firstName: data.firstName,
                middleName: data.middleName || null,
                lastName: data.lastName,
                // Email is stored in plain text so it stays visible to staff
                email: String(data.email).trim().toLowerCase(),
                phone: encryptDeterministic(normalizePhone(country, data.phone)),
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(), // fallback: DOB is collected in the main registration form
                nationality: data.nationality || '',
                currencyPreference: data.currencyPreference || 'USD',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                zipCode: String(data.zipCode).trim(),
                employmentStatus: data.employmentStatus || '',
                businessName: data.businessName || null,
                entityType: data.entityType || null,
                stateOfFormation: data.stateOfFormation || null,
                ein: data.ein || null,
                industry: data.industry || null,
                website: data.website || null,
                annualIncome: Number(data.annualIncome || 0),
                status: 'PENDING'
            }
        });
        return { success: true, id: application.id, referenceId };
    } catch (e) {
        console.error(e);
        throw new Error('Failed to submit application');
    }
}

export async function requestOnlineAccess(data: any) {
    try {
        const referenceId = `HT-ENR-${Math.floor(100000 + Math.random() * 900000)}`;
        const request = await prisma.onlineAccessRequest.create({
            data: {
                referenceId,
                accountNumber: encryptDeterministic(data.accountNumber),
                email: encryptDeterministic(data.email),
                ssnLast4: encryptDeterministic(data.ssn),
                firstName: data.firstName,
                lastName: data.lastName,
                phone: encryptDeterministic(data.phone),
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                status: 'PENDING'
            }
        });
        return { success: true, id: request.id, referenceId };
    } catch (e) {
        console.error(e);
        throw new Error('Failed to request online access');
    }
}
