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
          color: "bg-[color:var(--heritage-gold)]",
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

  let score = await prisma.creditScore.findFirst({
    where: {
      userId: session.user.id,
      month: monthKey,
    }
  });

  if (!score) {
    score = await prisma.creditScore.create({
      data: {
        userId: session.user.id,
        score: 785,
        change: 12,
        month: monthKey,
      }
    });
  }

  return score;
}
