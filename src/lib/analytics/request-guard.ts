const ALLOWED_FETCH_SITES = new Set(['same-origin', 'same-site', 'none']);

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sahilbzy.com'
  ).replace(/\/+$/, '');
}

function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  try {
    const site = new URL(getSiteUrl());
    origins.add(site.origin);
    if (site.hostname.startsWith('www.')) {
      origins.add(`${site.protocol}//${site.hostname.slice(4)}`);
    } else if (site.hostname.includes('.')) {
      origins.add(`${site.protocol}//www.${site.hostname}`);
    }
  } catch {
    // SITE_URL misconfigured — fail closed via empty allowlist.
  }

  if (process.env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }

  return origins;
}

export function isTrustedAnalyticsRequest(headers: Headers): boolean {
  const fetchSite = headers.get('sec-fetch-site')?.toLowerCase() ?? null;
  if (fetchSite && !ALLOWED_FETCH_SITES.has(fetchSite)) {
    return false;
  }

  const origin = headers.get('origin');
  if (origin) {
    return buildAllowedOrigins().has(origin);
  }

  // Modern same-origin beacons send Origin and/or Sec-Fetch-Site. Missing both
  // is treated as untrusted rather than accepting arbitrary cross-site posts.
  return fetchSite !== null && ALLOWED_FETCH_SITES.has(fetchSite);
}
