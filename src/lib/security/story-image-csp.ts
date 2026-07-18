/** Origin allowlisted for story images when R2_PUBLIC_BASE_URL is set. */
export function storyImageCspOrigin(
  publicBaseUrl: string | undefined | null
): string | null {
  const raw = publicBaseUrl?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}
