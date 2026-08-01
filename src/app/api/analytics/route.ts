import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { pageViews, windowOpens } from '@/db/schema';
import {
  normalizeAnalyticsPath,
  normalizeAnalyticsWindowType,
} from '@/lib/analytics/event-values';
import { normalizeReferrerOrigin } from '@/lib/analytics/normalize-referrer';
import { isTrustedAnalyticsRequest } from '@/lib/analytics/request-guard';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getClientIp, hashRateLimitKey } from '@/lib/request-ip';
import {
  BodyTooLargeError,
  InvalidJsonBodyError,
  UnsupportedMediaTypeError,
  readJsonBody,
} from '@/lib/http/read-json-body';

const MAX_BODY_BYTES = 8 * 1024;

const analyticsEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('page_view'),
    path: z.string().trim().min(1).max(300),
    referrer: z.string().trim().max(500).optional().nullable(),
  }),
  z.object({
    type: z.literal('window_open'),
    windowType: z.string().trim().min(1).max(80),
  }),
]);

function getDailySalt(): string | null {
  const salt = process.env.ANALYTICS_SALT;

  if (!salt) {
    return null;
  }

  return `${salt}:${new Date().toISOString().slice(0, 10)}`;
}

function hashVisitor(ip: string, userAgent: string, dailySalt: string): string {
  return createHash('sha256')
    .update(`${dailySalt}:${ip}:${userAgent}`)
    .digest('hex');
}

function detectDevice(userAgent: string): string {
  const value = userAgent.toLowerCase();

  if (/ipad|tablet/.test(value)) {
    return 'tablet';
  }

  if (/mobile|iphone|android/.test(value)) {
    return 'mobile';
  }

  return 'desktop';
}

function normalizeCountry(request: NextRequest): string | null {
  const country = request.headers.get('x-vercel-ip-country');

  if (!country || !/^[A-Z]{2}$/.test(country)) {
    return null;
  }

  return country;
}

export async function POST(request: NextRequest) {
  if (!isTrustedAnalyticsRequest(request.headers)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rateLimit = await enforceRateLimit('analytics', hashRateLimitKey(ip), {
    windowMs: 60_000,
    max: 120,
  });

  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const dailySalt = getDailySalt();

  if (!dailySalt) {
    return NextResponse.json({ ok: true, stored: false }, { status: 202 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }
    if (
      error instanceof UnsupportedMediaTypeError ||
      error instanceof InvalidJsonBodyError
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    throw error;
  }

  const parsed = analyticsEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  const visitorHash = hashVisitor(ip, userAgent, dailySalt);

  if (parsed.data.type === 'page_view') {
    const path = normalizeAnalyticsPath(parsed.data.path);
    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await db.insert(pageViews).values({
      path,
      visitorHash,
      country: normalizeCountry(request),
      device: detectDevice(userAgent),
      referrer: normalizeReferrerOrigin(parsed.data.referrer),
    });
  } else {
    const windowType = normalizeAnalyticsWindowType(parsed.data.windowType);
    if (!windowType) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await db.insert(windowOpens).values({
      windowType,
    });
  }

  return NextResponse.json({ ok: true });
}
