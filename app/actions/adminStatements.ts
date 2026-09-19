'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function handleGenerateStatement(formData: FormData) {
  const accountId = formData.get('accountId') as string;
  const period = formData.get('period') as string; // 'YYYY-MM'

  if (!accountId || !period) return;

  await prisma.statement.create({
    data: {
      accountId,
      period,
      filePath: `/downloads/statement_${accountId}_${period}.pdf`
    }
  });

  revalidatePath('/admin/finance/statements');
}
