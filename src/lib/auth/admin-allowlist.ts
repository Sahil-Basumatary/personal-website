// Single source of truth for the owner allowlist. Kept free of `server-only`
// so it can run in both the proxy (edge/node) and server components.
export function parseAdminUserIds(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((userId) => userId.trim())
      .filter(Boolean)
  );
}

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) {
    return false;
  }

  return parseAdminUserIds(process.env.ADMIN_USER_IDS).has(userId);
}
