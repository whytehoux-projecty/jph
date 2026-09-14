'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function sendContactMessage(data: any) {
  const session = await auth();
  
  // Create a notification for the user for demo purposes, 
  // or just log it if there's no session
  
  if (session?.user?.id) {
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Support Message Received',
        message: `We received your message: "${data.subject}". We will reply shortly.`,
      }
    });
  } else {
    console.log('Received contact message from unauthenticated user:', data);
  }

  return { success: true };
}
