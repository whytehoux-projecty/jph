'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: { minimumInitialDeposit: 50.00 }
        });
    }
    return settings;
}

export async function updateSystemSettings(data: { minimumInitialDeposit: number }) {
    let settings = await prisma.systemSettings.findFirst();
    if (settings) {
        await prisma.systemSettings.update({
            where: { id: settings.id },
            data: {
                minimumInitialDeposit: data.minimumInitialDeposit
            }
        });
    } else {
        await prisma.systemSettings.create({
            data: {
                minimumInitialDeposit: data.minimumInitialDeposit
            }
        });
    }
    revalidatePath('/admin/system/global-settings');
    revalidatePath('/register/[token]'); // Invalidate registration form cache to load new limit
    return { success: true };
}
