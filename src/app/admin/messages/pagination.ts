export const MESSAGES_PAGE_SIZE = 25;

export function parseMessagesPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }
  return Math.floor(page);
}
