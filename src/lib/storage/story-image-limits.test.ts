// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  STORY_IMAGE_MAX_BYTES,
  buildStoryImageStorageKey,
  detectStoryImageMime,
  publicUrlForStorageKey,
  validateStoryImageBytes,
} from './story-image-limits';

const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
]);
const WEBP = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const GIF = Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

describe('story-image-limits', () => {
  it('detects jpeg/png/webp from magic bytes', () => {
    expect(detectStoryImageMime(JPEG)).toBe('image/jpeg');
    expect(detectStoryImageMime(PNG)).toBe('image/png');
    expect(detectStoryImageMime(WEBP)).toBe('image/webp');
    expect(detectStoryImageMime(GIF)).toBeNull();
  });

  it('accepts signatures under the size cap', () => {
    expect(validateStoryImageBytes({ bytes: JPEG })).toEqual({
      ok: true,
      mimeType: 'image/jpeg',
    });
    expect(
      validateStoryImageBytes({
        bytes: PNG,
        declaredMimeType: 'image/png',
      })
    ).toEqual({ ok: true, mimeType: 'image/png' });
  });

  it('rejects empty, oversized, spoofed, and mismatched types', () => {
    expect(validateStoryImageBytes({ bytes: new Uint8Array() })).toEqual({
      ok: false,
      error: 'empty',
    });
    expect(
      validateStoryImageBytes({
        bytes: new Uint8Array(STORY_IMAGE_MAX_BYTES + 1),
      })
    ).toEqual({ ok: false, error: 'too_large' });
    expect(validateStoryImageBytes({ bytes: GIF })).toEqual({
      ok: false,
      error: 'unsupported_type',
    });
    expect(
      validateStoryImageBytes({
        bytes: JPEG,
        declaredMimeType: 'image/png',
      })
    ).toEqual({ ok: false, error: 'unsupported_type' });
    expect(
      validateStoryImageBytes({
        bytes: JPEG,
        declaredMimeType: 'image/gif',
      })
    ).toEqual({ ok: false, error: 'unsupported_type' });
  });

  it('builds stable storage keys and public urls', () => {
    expect(
      buildStoryImageStorageKey(
        'proj-1',
        'image/webp',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
      )
    ).toBe('projects/proj-1/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp');
    expect(
      publicUrlForStorageKey(
        'https://cdn.example.com/',
        '/projects/proj-1/a.jpg'
      )
    ).toBe('https://cdn.example.com/projects/proj-1/a.jpg');
  });
});
