import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',').at(0)?.trim();

  return firstForwardedIp || request.headers.get('x-real-ip') || 'unknown';
}

export function hashRateLimitKey(rawKey: string): string {
  const salt = process.env.ANALYTICS_SALT ?? 'rate-limit';
  return createHash('sha256').update(`${salt}:rl:${rawKey}`).digest('hex');
}
