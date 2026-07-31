const ALLOWED_WINDOW_TYPES = new Set([
  'about-computer',
  'browser',
  'code-playground',
  'contact-form',
  'file-explorer',
  'help',
  'minesweeper',
  'terminal',
  'text-editor',
]);

export function normalizeAnalyticsPath(path: string): string | null {
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }
  if (trimmed.includes('\\') || trimmed.includes('://')) {
    return null;
  }
  if (!/^\/[\w./\-?=&%]*$/i.test(trimmed)) {
    return null;
  }
  return trimmed.slice(0, 300);
}

export function normalizeAnalyticsWindowType(
  windowType: string
): string | null {
  const trimmed = windowType.trim();
  if (!ALLOWED_WINDOW_TYPES.has(trimmed)) {
    return null;
  }
  return trimmed;
}
