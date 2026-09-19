import { prisma } from '@/lib/prisma';
import { AdminStatementList } from '@/components/admin/AdminStatementList';
import { handleGenerateStatement } from '@/app/actions/adminStatements';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function StatementsPage() {
  const statements = await prisma.statement.findMany({
    orderBy: { generatedAt: 'desc' },
    include: {
      account: {
        select: {
          accountNumber: true,
          accountType: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      }
    }
  });

  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      accountNumber: true,
      accountType: true,
      user: {
        select: { firstName: true, lastName: true }
      }
    },
    orderBy: { user: { lastName: 'asc' } }
  });

  return (
    <AdminPageShell 
      title="Account Statements" 
      subtitle="Generate and view monthly account statements for customers."
    >
      <AdminStatementList 
        initialStatements={statements}
        accounts={accounts}
        onGenerate={handleGenerateStatement}
      />
    </AdminPageShell>
  );
}
