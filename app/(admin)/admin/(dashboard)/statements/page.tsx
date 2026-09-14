import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AdminStatementList } from '@/components/admin/AdminStatementList';

export default async function AdminStatementsPage() {
  const statements = await prisma.statement.findMany({
    orderBy: { generatedAt: 'desc' },
    include: {
      account: {
        select: {
          accountNumber: true,
          accountType: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
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
        select: {
          firstName: true,
          lastName: true,
        }
      }
    },
    orderBy: { user: { lastName: 'asc' } }
  });

  const handleGenerateStatement = async (formData: FormData) => {
    'use server'
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

    revalidatePath('/admin/statements');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Account Statements</h2>
          <p className="text-sm text-muted-foreground mt-1">Generate and view monthly account statements for customers.</p>
        </div>
      </div>

      <AdminStatementList 
        initialStatements={statements}
        accounts={accounts}
        onGenerate={handleGenerateStatement}
      />
    </div>
  );
}
