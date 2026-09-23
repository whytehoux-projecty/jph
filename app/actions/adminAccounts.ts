'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function handleToggleAccountStatus(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  
  await prisma.account.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath('/admin/customers/account-holders');
}

export async function handleUpdateAccountBalance(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const balanceStr = formData.get('balance') as string;
  const balance = parseFloat(balanceStr);

  if (isNaN(balance)) return;
  
  await prisma.account.update({
    where: { id },
    data: { balance }
  });
  
  revalidatePath('/admin/customers/account-holders');
}
