import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { runDueSavingsContributions } from '@/lib/savings-jobs';

export const dynamic = 'force-dynamic';

/**
 * Daily savings job, called by Vercel Cron (vercel.json). Vercel sends
 * "Authorization: Bearer <CRON_SECRET>"; without CRON_SECRET set, the job
 * refuses to run rather than being open to anyone.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[cron/savings] CRON_SECRET is not set; job not run.');
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await runDueSavingsContributions();
  console.info(`[cron/savings] due=${summary.due} saved=${summary.saved} reminded=${summary.reminded} skipped=${summary.skipped}`);
  return NextResponse.json(summary);
}
