'use server'

import { prisma } from '@/lib/prisma'

export async function requestAccountOpening(data: any) {
    try {
        const application = await prisma.accountApplication.create({
            data: {
                applicationType: data.applicationType || 'PERSONAL',
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                dateOfBirth: new Date(data.dateOfBirth),
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                employmentStatus: data.employmentStatus,
                annualIncome: Number(data.annualIncome),
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
