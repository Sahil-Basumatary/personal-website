import { sql } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import { checkMigrationReadiness } from '@/lib/db/migration-readiness';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getClientIp, hashRateLimitKey } from '@/lib/request-ip';
import { reportServerError } from '@/lib/observability/report-server-error';

// Node runtime: Neon + Drizzle need Node APIs; this is a deep check
// (real DB round-trip + migration readiness), not an edge-cached ping.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const rateLimit = await enforceRateLimit(
    'health',
    hashRateLimitKey(getClientIp(request)),
    {
      windowMs: 60_000,
      max: 60,
    }
  );

  if (!rateLimit.ok) {
    return NextResponse.json({ status: 'error' }, { status: 429 });
  }

  const time = new Date().toISOString();

  try {
    await db.execute(sql`select 1`);
    const migrations = await checkMigrationReadiness(db);
    if (!migrations.ok) {
      return NextResponse.json(
        {
          status: 'error',
          db: 'up',
          migrations: migrations.reason,
          expected: migrations.expected,
          applied: migrations.applied,
          latest: migrations.latestTag,
          time,
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      {
        status: 'ok',
        db: 'up',
        migrations: 'ready',
        expected: migrations.expected,
        applied: migrations.applied,
        latest: migrations.latestTag,
        time,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    reportServerError(error, { scope: 'api:health' });
    return NextResponse.json(
      { status: 'error', db: 'down', time },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
