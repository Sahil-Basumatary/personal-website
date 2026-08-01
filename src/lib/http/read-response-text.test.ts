// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ResponseTooLargeError, readResponseText } from './read-response-text';

describe('readResponseText', () => {
  it('reads a small response body', async () => {
    const response = new Response('hello feed', {
      headers: { 'content-type': 'application/json' },
    });
    await expect(readResponseText(response, 1024)).resolves.toBe('hello feed');
  });

  it('rejects oversized content-length before reading', async () => {
    const response = new Response('tiny', {
      headers: { 'content-length': '99999' },
    });
    await expect(readResponseText(response, 16)).rejects.toBeInstanceOf(
      ResponseTooLargeError
    );
  });

  it('rejects bodies that grow past the limit while streaming', async () => {
    const payload = 'x'.repeat(128);
    const response = new Response(payload);
    await expect(readResponseText(response, 32)).rejects.toBeInstanceOf(
      ResponseTooLargeError
    );
  });
});
