import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add sidebar_preferences to User
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'sidebar_preferences') THEN 
          ALTER TABLE "User" ADD COLUMN "sidebar_preferences" TEXT;
        END IF; 
      END $$;
    `);

    // Add fields to transactions
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'category') THEN 
          ALTER TABLE "transactions" 
            ADD COLUMN "category" TEXT,
            ADD COLUMN "channel" TEXT,
            ADD COLUMN "counterparty" TEXT,
            ADD COLUMN "running_balance" DOUBLE PRECISION,
            ADD COLUMN "notes" TEXT,
            ADD COLUMN "is_admin_entry" BOOLEAN NOT NULL DEFAULT false,
            ADD COLUMN "admin_audit_trail" TEXT;
        END IF; 
      END $$;
    `);

    return NextResponse.json({ success: true, message: 'Database migrated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
