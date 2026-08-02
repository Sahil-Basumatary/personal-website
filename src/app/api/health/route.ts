import { sql } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getClientIp, hashRateLimitKey } from '@/lib/request-ip';
import { reportServerError } from '@/lib/observability/report-server-error';

// Node runtime: Neon + Drizzle need Node APIs; this is a deep check
// (real DB round-trip), not an edge-cached ping.
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
    return NextResponse.json(
      { status: 'ok', db: 'up', time },
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
