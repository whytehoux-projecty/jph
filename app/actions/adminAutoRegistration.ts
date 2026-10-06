'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { buildAutoFillData } from '@/lib/registration/autofill';
import { submitRegistrationForm } from '@/app/actions/registrationForm';

export async function autoFillRegistration(
    applicationId: string,
    input: {
        initialDepositAmount: number;
        screeningCompleted: boolean;
        agreementsObtained: boolean;
    }
): Promise<{ success: boolean; error?: string; accountId?: string; userId?: string }> {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    const app = await prisma.accountApplication.findUnique({ where: { id: applicationId } });
    if (!app) return { success: false, error: 'Application not found' };
    if (app.applicationType === 'BUSINESS') {
        return { success: false, error: 'Auto-fill supports Personal accounts only' };
    }
    if (app.status !== 'APPROVED' || app.registrationFormId || !app.registrationToken) {
        return { success: false, error: 'Application must be approved and not yet registered' };
    }
    if (!input.screeningCompleted || !input.agreementsObtained) {
        return { success: false, error: 'Both compliance confirmations are required' };
    }
    if (!Number.isFinite(input.initialDepositAmount) || input.initialDepositAmount < 0) {
        return { success: false, error: 'Invalid initial deposit amount' };
    }

    try {
        const data = buildAutoFillData(app, input);
        const result = await submitRegistrationForm(app.registrationToken, data);
        return { success: true, accountId: result.accountId, userId: result.userId };
    } catch (e: any) {
        return { success: false, error: e?.message || 'Auto-fill failed' };
    }
}
