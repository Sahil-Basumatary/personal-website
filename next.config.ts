import { withSerwist } from '@serwist/turbopack';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Two years + subdomains, no preload yet: preload is effectively irreversible.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['resend', 'postal-mime'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(withSerwist(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Keep build output quiet locally; only stream upload logs in CI.
  silent: !process.env.CI,
  // Same-origin route that proxies browser events past ad blockers. The proxy
  // matcher must let this path through (handled in A4).
  tunnelRoute: '/monitoring',
  widenClientFileUpload: true,
  // Upload maps for readable stack traces, then strip them from the client
  // bundle so source is never served to visitors.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
