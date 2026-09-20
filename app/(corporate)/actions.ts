'use server'

import { prisma } from '@/lib/prisma'

export async function requestAccountOpening(data: any) {
    try {
        const application = await prisma.accountApplication.create({
            data: {
                applicationType: data.applicationType || 'PERSONAL',
                desiredAccountType: data.desiredAccountType,
                isExistingCustomer: data.isExistingCustomer,
                isUsCitizenOrResident: data.isUsCitizenOrResident,
                consentComms: data.consentComms,
                consentPrivacy: data.consentPrivacy,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(), // Using current date as fallback since dateOfBirth is removed from initial form
                nationality: data.nationality || '',
                currencyPreference: data.currencyPreference || 'USD',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                zipCode: data.zipCode,
                employmentStatus: data.employmentStatus || '',
                annualIncome: Number(data.annualIncome || 0),
                status: 'PENDING'
            }
        });
        return { success: true, id: application.id };
    } catch (e) {
        console.error(e);
        throw new Error('Failed to submit application');
    }
}

export async function requestOnlineAccess(data: any) {
    try {
        const request = await prisma.onlineAccessRequest.create({
            data: {
                accountNumber: data.accountNumber,
                email: data.email,
                status: 'PENDING'
            }
        });
        return { success: true, id: request.id };
    } catch (e) {
        console.error(e);
        throw new Error('Failed to request online access');
    }
}
