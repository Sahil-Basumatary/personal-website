import 'server-only';

import * as Sentry from '@sentry/nextjs';

export function reportServerError(
  error: unknown,
  options: {
    scope: string;
    extra?: Record<string, unknown>;
  }
): void {
  Sentry.captureException(error, {
    tags: { scope: options.scope },
    extra: options.extra,
  });
}
