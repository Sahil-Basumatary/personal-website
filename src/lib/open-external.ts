export function openExternalUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export const BROWSER_EMBED_TIMEOUT_MS = 10_000;
