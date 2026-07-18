// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  STORY_IMAGE_MAX_BYTES,
  buildStoryImageStorageKey,
  publicUrlForStorageKey,
  validateStoryImageBytes,
} from './story-image-limits';

describe('story-image-limits', () => {
  it('accepts jpeg/png/webp under the size cap', () => {
    expect(
      validateStoryImageBytes({
        mimeType: 'image/jpeg',
        byteLength: 1024,
      })
    ).toEqual({ ok: true, mimeType: 'image/jpeg' });
  });

  it('rejects empty, oversized, and unsupported types', () => {
    expect(
      validateStoryImageBytes({ mimeType: 'image/png', byteLength: 0 })
    ).toEqual({ ok: false, error: 'empty' });
    expect(
      validateStoryImageBytes({
        mimeType: 'image/png',
        byteLength: STORY_IMAGE_MAX_BYTES + 1,
      })
    ).toEqual({ ok: false, error: 'too_large' });
    expect(
      validateStoryImageBytes({
        mimeType: 'image/gif',
        byteLength: 100,
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
