'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getBeneficiaries() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return beneficiaries;
}

export async function getBeneficiariesByMethod(method?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  if (!method) {
    return prisma.beneficiary.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  const isInternal = method === 'INTERNAL' || method === 'internal';

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { 
      userId: session.user.id,
      deletedAt: null,
      ...(method === 'INTERNAL' || method === 'EXTERNAL' ? { isInternal } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return beneficiaries;
}

export async function createBeneficiary(data: {
  name: string;
  nickname?: string;
  rail: string;
  details: string;
  isInternal?: boolean;
  accountNumber?: string;
  bankName?: string;
  swiftCode?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  let parsedDetails: any = {};
  try {
    parsedDetails = typeof data.details === 'string' ? JSON.parse(data.details) : (data.details || {});
  } catch {
    parsedDetails = {};
  }

  const accountNumber = data.accountNumber || parsedDetails.accountNumber || parsedDetails.iban || parsedDetails.address || parsedDetails.cashtag || parsedDetails.username || null;
  const bankName = data.bankName || parsedDetails.bankName || null;
  const swiftCode = data.swiftCode || parsedDetails.swiftBic || null;

  const beneficiary = await prisma.beneficiary.create({
    data: {
      name: data.name,
      nickname: data.nickname || null,
      rail: data.rail,
      details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
      isInternal: data.isInternal ?? false,
      accountNumber,
      bankName,
      swiftCode,
      userId: session.user.id,
    }
  });

  return beneficiary;
}

export async function updateBeneficiary(id: string, data: {
  name?: string;
  nickname?: string;
  rail?: string;
  details?: string;
  isInternal?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const beneficiary = await prisma.beneficiary.findUnique({ where: { id } });
  
  if (!beneficiary || beneficiary.userId !== session.user.id) {
    throw new Error('Not found or unauthorized');
  }

  const updated = await prisma.beneficiary.update({
    where: { id },
    data
  });

  return updated;
}

export async function deleteBeneficiary(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const beneficiary = await prisma.beneficiary.findUnique({ where: { id } });
  
  if (!beneficiary || beneficiary.userId !== session.user.id) {
    throw new Error('Not found or unauthorized');
  }

  // Soft delete
  await prisma.beneficiary.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  return { success: true };
}
