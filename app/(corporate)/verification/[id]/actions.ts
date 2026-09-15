'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function scheduleVerification(data: {
    id: string;
    meetingDate: string; // ISO string
    meetingTime: string; // HH:mm format
    meetingMethod: string;
}) {
    try {
        const meetingDateTime = new Date(`${data.meetingDate}T${data.meetingTime}:00Z`); // Very simple combination
        
        await prisma.accountApplication.update({
            where: { id: data.id },
            data: {
                scheduledMeetingAt: meetingDateTime,
                meetingMethod: data.meetingMethod
            }
        });

        revalidatePath(`/admin/applications`);
        return { success: true };
    } catch (e) {
        console.error('Scheduling error:', e);
        throw new Error('Failed to schedule meeting');
    }
}
