import { NextResponse, type NextRequest } from 'next/server';
import { validateContact } from '@/lib/contact-validation';
import { checkRateLimit } from '@/lib/rate-limit';

// We hold rate-limit buckets in process memory, so the handler must run on
// the long-lived Node runtime. Edge would reset state on every invocation.
export const runtime = 'nodejs';

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = {
  windowMs: 10 * 60 * 1000,
  max: 5,
} as const;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export async function POST(req: NextRequest) {
  const declaredLength = Number(req.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'Request body too large.' },
      { status: 413 }
    );
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit('contact', ip, RATE_LIMIT);
  if (!rate.ok) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((rate.resetAt - Date.now()) / 1000)
    );
    return NextResponse.json(
      {
        ok: false,
        error: 'Too many requests. Give it a few minutes before trying again.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON.' },
      { status: 400 }
    );
  }

  const result = validateContact(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 }
    );
  }

  // Phase 7 swaps this for Resend + DB persistence. Until then, the function
  // log is the source of truth — message preview is truncated to keep logs
  // readable and to avoid pasting massive payloads into the platform UI.
  console.log('[contact]', {
    ip,
    name: result.data.name,
    email: result.data.email,
    subject: result.data.subject,
    messagePreview: result.data.message.slice(0, 100),
    messageLength: result.data.message.length,
  });

  return NextResponse.json({ ok: true });
}
