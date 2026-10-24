'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getStatements() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  const accountIds = accounts.map(a => a.id);

  const statements = await prisma.statement.findMany({
    where: { accountId: { in: accountIds } },
    include: { account: true },
    orderBy: { generatedAt: 'desc' }
  });

  return statements;
}

export async function generateStatement(accountId: string, period: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== session.user.id) throw new Error('Unauthorized');

  const statement = await prisma.statement.create({
    data: {
      accountId,
      period
    }
  });

  return statement;
}

export async function getStatementDetails(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const statement = await prisma.statement.findUnique({ 
    where: { id },
    include: { account: true }
  });

  if (!statement) throw new Error('Not found');
  
  const account = await prisma.account.findUnique({ where: { id: statement.accountId } });
  if (!account || account.userId !== session.user.id) throw new Error('Unauthorized');

  // The statement view (app/(portal)/statements/[id]) renders the period's
  // posted transactions; no stored PDF is involved.
  return statement;
}
