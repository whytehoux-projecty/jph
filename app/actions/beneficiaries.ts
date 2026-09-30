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

export async function getBeneficiariesByMethod(method: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const isInternal = method === 'INTERNAL';

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { 
      userId: session.user.id,
      deletedAt: null,
      isInternal
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
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const beneficiary = await prisma.beneficiary.create({
    data: {
      ...data,
      isInternal: data.isInternal ?? false,
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
