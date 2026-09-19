'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function handleToggleCardStatus(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  
  await prisma.card.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath('/admin/finance/cards');
}
