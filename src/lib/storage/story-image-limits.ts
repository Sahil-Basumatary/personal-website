export const STORY_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const STORY_IMAGE_MAX_PER_PROJECT = 8;
export const STORY_IMAGE_SIGNED_URL_TTL_SECONDS = 15 * 60;

export const STORY_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type StoryImageMimeType = (typeof STORY_IMAGE_MIME_TYPES)[number];

export function isStoryImageMimeType(
  value: string
): value is StoryImageMimeType {
  return (STORY_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

export function extensionForStoryImageMime(
  mimeType: StoryImageMimeType
): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
  }
}

export type StoryImageValidationError =
  | 'unsupported_type'
  | 'too_large'
  | 'empty';

export function detectStoryImageMime(
  bytes: Uint8Array
): StoryImageMimeType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

function normalizeDeclaredMime(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const mediaType = value.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType || null;
}

export function validateStoryImageBytes(options: {
  bytes: Uint8Array;
  declaredMimeType?: string;
}):
  | { ok: true; mimeType: StoryImageMimeType }
  | {
      ok: false;
      error: StoryImageValidationError;
    } {
  if (options.bytes.byteLength <= 0) {
    return { ok: false, error: 'empty' };
  }
  if (options.bytes.byteLength > STORY_IMAGE_MAX_BYTES) {
    return { ok: false, error: 'too_large' };
  }

  const detected = detectStoryImageMime(options.bytes);
  if (!detected) {
    return { ok: false, error: 'unsupported_type' };
  }

  const declared = normalizeDeclaredMime(options.declaredMimeType);
  if (declared && declared !== detected) {
    return { ok: false, error: 'unsupported_type' };
  }

  return { ok: true, mimeType: detected };
}

export function buildStoryImageStorageKey(
  projectId: string,
  mimeType: StoryImageMimeType,
  id: string
): string {
  const ext = extensionForStoryImageMime(mimeType);
  return `projects/${projectId}/${id}.${ext}`;
}

export function publicObjectKeyForStoryImage(storageKey: string): string {
  const key = storageKey.replace(/^\/+/, '');
  if (key.startsWith('public/')) {
    return key;
  }
  return `public/${key}`;
}

export function publicUrlForStorageKey(
  publicBaseUrl: string,
  storageKey: string
): string {
  const base = publicBaseUrl.replace(/\/+$/, '');
  const key = storageKey.replace(/^\/+/, '');
  return `${base}/${key}`;
}

export function mimeTypeFromStoryImageStorageKey(
  storageKey: string
): StoryImageMimeType {
  const lower = storageKey.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
}
