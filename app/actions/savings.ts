'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getSavingsGoal() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  let goal = await prisma.savingsGoal.findFirst({
    where: { userId: session.user.id }
  });

  if (!goal) {
    goal = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        name: 'New Car',
        targetAmount: 25000,
        currentAmount: 0,
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }
    });
  }

  return goal;
}

export async function updateSavingsGoal(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const goal = await prisma.savingsGoal.findFirst({
    where: { userId: session.user.id }
  });

  if (!goal) throw new Error('Not found');

  const updated = await prisma.savingsGoal.update({
    where: { id: goal.id },
    data: {
      name: data.name,
      targetAmount: parseFloat(data.targetAmount),
      targetDate: new Date(data.targetDate)
    }
  });

  return updated;
}
