export const STORY_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const STORY_IMAGE_MAX_PER_PROJECT = 8;

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

export function validateStoryImageBytes(options: {
  mimeType: string;
  byteLength: number;
}):
  | { ok: true; mimeType: StoryImageMimeType }
  | {
      ok: false;
      error: StoryImageValidationError;
    } {
  if (options.byteLength <= 0) {
    return { ok: false, error: 'empty' };
  }
  if (options.byteLength > STORY_IMAGE_MAX_BYTES) {
    return { ok: false, error: 'too_large' };
  }
  if (!isStoryImageMimeType(options.mimeType)) {
    return { ok: false, error: 'unsupported_type' };
  }
  return { ok: true, mimeType: options.mimeType };
}

export function buildStoryImageStorageKey(
  projectId: string,
  mimeType: StoryImageMimeType,
  id: string
): string {
  const ext = extensionForStoryImageMime(mimeType);
  return `projects/${projectId}/${id}.${ext}`;
}

export function publicUrlForStorageKey(
  publicBaseUrl: string,
  storageKey: string
): string {
  const base = publicBaseUrl.replace(/\/+$/, '');
  const key = storageKey.replace(/^\/+/, '');
  return `${base}/${key}`;
}
