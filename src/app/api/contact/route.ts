import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import { contactSubmissions } from '@/db/schema';
import { sendContactNotification } from '@/lib/email';
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

  const inserted = await db
    .insert(contactSubmissions)
    .values({
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject,
      message: result.data.message,
    })
    .returning();
  const submission = inserted.at(0);

  if (submission) {
    try {
      await sendContactNotification(submission);
    } catch (error) {
      console.warn('[contact] notification email failed', error);
    }
  } else {
    console.warn('[contact] submission insert did not return a row', { ip });
  }

  return NextResponse.json({
    ok: true,
    emailNotification: {
      configured: Boolean(
        process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_TO
      ),
    },
  });
}
