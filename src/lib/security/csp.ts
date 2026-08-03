import {
  storyImageCspOrigin,
  storyImageSignedCspOrigin,
} from './story-image-csp';

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
  const storyImageOrigin = storyImageCspOrigin(process.env.R2_PUBLIC_BASE_URL);
  const signedStoryImageOrigin = storyImageSignedCspOrigin(
    process.env.R2_ACCOUNT_ID
  );
  const imgSrc = [
    `'self'`,
    'data:',
    'blob:',
    'https://img.clerk.com',
    ...(storyImageOrigin ? [storyImageOrigin] : []),
    ...(signedStoryImageOrigin ? [signedStoryImageOrigin] : []),
  ].join(' ');

  const directives = [
    `default-src 'self'`,
    // wasm-unsafe-eval: Monaco (code-playground/text-editor) instantiates WASM.
    // unsafe-eval is dev-only for Turbopack HMR and never ships to production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${
      isDev ? " 'unsafe-eval'" : ''
    }`,
    // Next and Tailwind inject inline styles; nonced styles are impractical here.
    // jsdelivr: Monaco streams its editor stylesheet from the CDN.
    `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`,
    `img-src ${imgSrc}`,
    // data: covers Monaco's inlined codicon icon font.
    `font-src 'self' data:`,
    `worker-src 'self' blob:`,
    // ws: covers the dev HMR socket; Clerk FAPI + telemetry for auth.
    // jsdelivr: Pyodide (code-playground) fetches its wasm runtime and packages.
    `connect-src 'self' https://*.clerk.accounts.dev https://clerk.sahilbzy.com https://clerk-telemetry.com https://cdn.jsdelivr.net${
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
