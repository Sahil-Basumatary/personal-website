// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/http/read-response-text', () => ({
  readResponseText: vi.fn(async () => '{"items":[]}'),
}));

import { readResponseText } from '@/lib/http/read-response-text';
import { getRecentPosts } from './blog-feed';
import { FALLBACK_POSTS } from './fallback-posts';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(readResponseText).mockReset();
  vi.mocked(readResponseText).mockResolvedValue('{"items":[]}');
});

describe('getRecentPosts feed fetch bounds', () => {
  it('passes an abort timeout to feed fetches', async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        return new Response('{"items":[]}', { status: 200 });
      }
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.mocked(readResponseText).mockResolvedValue('{"items":[]}');

    await getRecentPosts();

    expect(fetchMock).toHaveBeenCalled();
  });

  it('falls back when the feed fetch aborts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new DOMException('The operation was aborted.', 'AbortError');
      })
    );

    await expect(getRecentPosts()).resolves.toEqual(FALLBACK_POSTS);
  });
});
