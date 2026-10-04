"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getBudgets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const date = new Date();
  const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

  let budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
      month: monthKey,
    }
  });

  // If no budgets for this month, seed some initial data
  if (budgets.length === 0) {
    budgets = await prisma.$transaction([
      prisma.budget.create({
        data: {
          userId: session.user.id,
          category: "Food & Dining",
          limit: 600,
          spent: 450,
          color: "bg-orange-500",
          month: monthKey,
        }
      }),
      prisma.budget.create({
        data: {
          userId: session.user.id,
          category: "Transport",
          limit: 200,
          spent: 120,
          color: "bg-blue-500",
          month: monthKey,
        }
      }),
      prisma.budget.create({
        data: {
          userId: session.user.id,
          category: "Shopping",
          limit: 400,
          spent: 150,
          color: "bg-(--heritage-gold)",
          month: monthKey,
        }
      })
    ]);
  }

  return budgets;
}

export async function getCreditScore() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const date = new Date();
  const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      creditScores: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!user) return null;

  let score = await prisma.creditScore.findFirst({
    where: {
      userId: session.user.id,
      month: monthKey,
    }
  });

  if (!score) {
    let lastScore = 785;
    let change = 12;

    if (user.creditScores.length > 0) {
      const prev = user.creditScores[0];
      lastScore = prev.score;
      
      const mode = (user as any).creditScoreAutoMode || 'MANUAL';
      const fixedChange = (user as any).creditScoreFixedChange || 0;

      if (mode === 'RANDOM') {
        change = Math.floor(Math.random() * 21) - 10; // -10 to +10
      } else if (mode === 'FIXED_INCREASE') {
        change = Math.abs(fixedChange) || 5;
      } else if (mode === 'FIXED_DECREASE') {
        change = -Math.abs(fixedChange) || -5;
      } else {
        change = 0; // MANUAL
      }
    }

    score = await prisma.creditScore.create({
      data: {
        userId: session.user.id,
        score: lastScore + change,
        change: change,
        month: monthKey,
      }
    });
  }

  return score;
}
