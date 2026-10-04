'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { TransferMethodConfig } from '@prisma/client';

export async function updateTransferMethodConfig(id: string, data: Partial<TransferMethodConfig>) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Unauthorized');

  const updated = await prisma.transferMethodConfig.update({
    where: { id },
    data: {
      displayName: data.displayName,
      baseFee: data.baseFee,
      percentageFee: data.percentageFee,
      processingTime: data.processingTime,
      perTransferLimit: data.perTransferLimit,
      dailyLimit: data.dailyLimit,
      isEnabled: data.isEnabled,
      isVisibleToUser: data.isVisibleToUser,
    }
  });

  revalidatePath('/admin/ebank/transfers');
  revalidatePath('/transfer');
  
  return updated;
}
