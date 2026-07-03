const isDev = process.env.NODE_ENV !== 'production';

// 128 bits of CSPRNG entropy, base64-encoded. Edge-runtime safe (no Buffer).
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

// Builds the site-wide policy for a single request. `strict-dynamic` is the
// security-critical choice: it disables host allowlisting for scripts and trusts
// only the per-request nonce (and whatever that nonced code loads), so an
// injected inline/host script cannot execute even if markup is compromised.
export function buildContentSecurityPolicy(nonce: string): string {
  const directives = [
    `default-src 'self'`,
    // wasm-unsafe-eval: Monaco (code-playground/text-editor) instantiates WASM.
    // unsafe-eval is dev-only for Turbopack HMR and never ships to production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${
      isDev ? " 'unsafe-eval'" : ''
    }`,
    // Next and Tailwind inject inline styles; nonced styles are impractical here.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://img.clerk.com`,
    `font-src 'self'`,
    `worker-src 'self' blob:`,
    // ws: covers the dev HMR socket; Clerk FAPI + telemetry for auth.
    `connect-src 'self' https://*.clerk.accounts.dev https://clerk.sahilbzy.com https://clerk-telemetry.com${
      isDev ? ' ws:' : ''
    }`,
    // The Browser app is a deliberate embedder of arbitrary external sites.
    `frame-src 'self' https:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];

  if (!isDev) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}
