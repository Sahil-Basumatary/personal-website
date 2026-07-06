import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // 10% in prod keeps volume within the free tier while still surfacing trends;
  // full sampling locally so nothing is missed while developing.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  sendDefaultPii: false,
});
