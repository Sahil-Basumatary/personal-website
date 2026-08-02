import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import { purgeExpiredPortfolioData } from '@/lib/data-retention';
import { reportServerError } from '@/lib/observability/report-server-error';
import { retryStorageDeletionTombstones } from '@/lib/storage/deletion-tombstones';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authorization = request.headers.get('authorization');
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const retention = await purgeExpiredPortfolioData(db);
    const tombstones = await retryStorageDeletionTombstones(db);
    return NextResponse.json(
      { ok: true, retention, tombstones },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    reportServerError(error, { scope: 'api:cron-purge-expired' });
    return NextResponse.json(
      { ok: false },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
