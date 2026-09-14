'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  return user;
}

export async function updateProfile(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone
    }
  });

  return updated;
}

export async function changePassword(data: any) {
  // In a real application, you would verify the current password,
  // hash the new password (e.g. using bcrypt), and save it.
  // For demo, we just simulate success.
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  return { success: true };
}

export async function updatePreferences(data: any) {
  // Demo mock to update language/currency preferences
  // Could be stored in metadata column of User in a real app
  return { success: true };
}

export async function updateNotificationSettings(data: any) {
  // Demo mock to update notification preferences
  return { success: true };
}
