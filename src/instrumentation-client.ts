import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  sendDefaultPii: false,
  integrations: [Sentry.replayIntegration()],
  // Record replays only when an error occurs: full diagnostic context for real
  // problems, zero replay volume (and cost/noise) for healthy sessions.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
