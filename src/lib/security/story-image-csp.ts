/** Origins allowlisted for story images in img-src. */

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

export function storyImageSignedCspOrigin(
  accountId: string | undefined | null
): string | null {
  const id = accountId?.trim();
  if (!id || !/^[a-f0-9]{32}$/i.test(id)) {
    return null;
  }
  return `https://${id}.r2.cloudflarestorage.com`;
}
