'use server'

import { prisma } from '@/lib/prisma'
import { encryptDeterministic } from '@/lib/encryption'

export async function requestAccountOpening(data: any) {
    try {
        const referenceId = `HT-APP-${Math.floor(100000 + Math.random() * 900000)}`;
        const application = await prisma.accountApplication.create({
            data: {
                referenceId,
                applicationType: data.applicationType || 'PERSONAL',
                desiredAccountType: data.desiredAccountType,
                isExistingCustomer: data.isExistingCustomer,
                isUsCitizenOrResident: data.isUsCitizenOrResident,
                consentComms: data.consentComms,
                consentPrivacy: data.consentPrivacy,
                firstName: data.firstName,
                lastName: data.lastName,
                email: encryptDeterministic(data.email),
                phone: encryptDeterministic(data.phone),
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(), // Using current date as fallback since dateOfBirth is removed from initial form
                nationality: data.nationality || '',
                currencyPreference: data.currencyPreference || 'USD',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                zipCode: data.zipCode,
                employmentStatus: data.employmentStatus || '',
                businessName: data.businessName || null,
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
