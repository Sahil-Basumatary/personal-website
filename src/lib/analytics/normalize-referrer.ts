export function normalizeReferrerOrigin(
  referrer: string | null | undefined
): string | null {
  if (!referrer) {
    return null;
  }

  const trimmed = referrer.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}
