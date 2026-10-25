import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminCardsManager } from "@/components/admin/AdminCardsManager";

export const dynamic = "force-dynamic";

export default async function AdminCardsPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/admin/login");
  }

  const [cards, usersWithAccounts] = await Promise.all([
    prisma.card.findMany({
      include: {
        account: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        accounts: {
          some: {},
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        accounts: {
          select: {
            id: true,
            accountType: true,
            accountNumber: true,
            balance: true,
            isPrimary: true,
          },
        },
      },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <AdminPageShell
      title="Cards & Facilities Management"
      subtitle="Issue cards to customers, set card artwork and daily limits, and freeze or block cards."
    >
      <AdminCardsManager
        cards={cards as any}
        usersWithAccounts={usersWithAccounts as any}
      />
    </AdminPageShell>
  );
}
