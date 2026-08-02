import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import { contactSubmissions } from '@/db/schema';
import { sendContactNotification } from '@/lib/email';
import { validateContact } from '@/lib/contact-validation';
import {
  BodyTooLargeError,
  InvalidJsonBodyError,
  UnsupportedMediaTypeError,
  readJsonBody,
} from '@/lib/http/read-json-body';
import { reportServerError } from '@/lib/observability/report-server-error';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getClientIp, hashRateLimitKey } from '@/lib/request-ip';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = {
  windowMs: 10 * 60 * 1000,
  max: 5,
} as const;

export async function POST(req: NextRequest) {
  const rate = await enforceRateLimit(
    'contact',
    hashRateLimitKey(getClientIp(req)),
    RATE_LIMIT
  );
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
    body = await readJsonBody(req, MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json(
        { ok: false, error: 'Request body too large.' },
        { status: 413 }
      );
    }
    if (error instanceof UnsupportedMediaTypeError) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported media type.' },
        { status: 415 }
      );
    }
    if (error instanceof InvalidJsonBodyError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON.' },
        { status: 400 }
      );
    }
    throw error;
  }

  const result = validateContact(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 }
    );
  }

  let submission: typeof contactSubmissions.$inferSelect | undefined;
  try {
    const inserted = await db
      .insert(contactSubmissions)
      .values({
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject,
        message: result.data.message,
      })
      .returning();
    submission = inserted.at(0);
  } catch (error) {
    reportServerError(error, { scope: 'api:contact' });
    return NextResponse.json(
      { ok: false, error: 'Unable to save your message right now.' },
      { status: 500 }
    );
  }

  if (submission) {
    try {
      await sendContactNotification(submission);
    } catch (error) {
      reportServerError(error, { scope: 'api:contact-notify' });
    }
  } else {
    console.warn('[contact] submission insert did not return a row');
  }

  return NextResponse.json({ ok: true });
}
