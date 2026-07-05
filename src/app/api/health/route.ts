import { sql } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import { checkRateLimit } from '@/lib/rate-limit';

// Node runtime: the Neon HTTP driver and Drizzle expect Node APIs, and this is
// a deep check (real DB round-trip), not an edge-cached ping.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',').at(0)?.trim();

  return firstForwardedIp || request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit('health', getClientIp(request), {
    windowMs: 60_000,
    max: 60,
  });

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
  } catch {
    // Deliberately opaque: a public probe must not leak driver/schema details.
    return NextResponse.json(
      { status: 'error', db: 'down', time },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
