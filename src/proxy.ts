import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdminUserId } from '@/lib/auth/admin-allowlist';
import { buildContentSecurityPolicy, generateNonce } from '@/lib/security/csp';

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy(nonce);

  if (isAdminRoute(request)) {
    const { userId } = await auth();

    if (!isAdminUserId(userId)) {
      const notFoundResponse = NextResponse.rewrite(
        new URL('/404', request.url),
        { status: 404 }
      );
      notFoundResponse.headers.set('Content-Security-Policy-Report-Only', csp);
      return notFoundResponse;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  // Next reads the nonce from the enforced-name CSP request header to thread it
  // into framework scripts and force dynamic rendering. The browser only ever
  // receives the Report-Only variant below, so nothing is blocked yet.
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy-Report-Only', csp);
  return response;
});

export const config = {
  matcher: [
    // `monitoring` is the Sentry tunnel route: under Turbopack the browser's
    // event POSTs fail if the proxy intercepts it, so it must bypass this.
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
