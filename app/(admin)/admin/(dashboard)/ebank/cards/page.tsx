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

  const [cards, rawCardRequests, usersWithAccounts] = await Promise.all([
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
    prisma.cardRequest.findMany({
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

  // Lookup users and accounts for card requests
  const userIds = Array.from(new Set(rawCardRequests.map((r) => r.userId)));
  const accountIds = Array.from(
    new Set(rawCardRequests.map((r) => r.accountId).filter(Boolean) as string[])
  );

  const [requestUsers, requestAccounts] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.account.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, accountNumber: true, accountType: true, balance: true },
    }),
  ]);

  const userMap = new Map(requestUsers.map((u) => [u.id, u]));
  const accountMap = new Map(requestAccounts.map((a) => [a.id, a]));

  const cardRequests = rawCardRequests.map((req) => ({
    ...req,
    user: userMap.get(req.userId) || {
      id: req.userId,
      firstName: "Customer",
      lastName: req.userId.slice(0, 5),
      email: "customer@portal.com",
    },
    account: req.accountId ? accountMap.get(req.accountId) || null : null,
  }));

  return (
    <AdminPageShell
      title="Cards & Facilities Management"
      subtitle="Underwrite customer card applications, customize luxury card artwork, manage daily limits, and supervise risk freeze controls."
    >
      <AdminCardsManager
        cards={cards as any}
        cardRequests={cardRequests as any}
        usersWithAccounts={usersWithAccounts as any}
      />
    </AdminPageShell>
  );
}
