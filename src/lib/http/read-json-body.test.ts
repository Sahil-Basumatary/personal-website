// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  BodyTooLargeError,
  InvalidJsonBodyError,
  UnsupportedMediaTypeError,
  readJsonBody,
} from './read-json-body';

function jsonRequest(
  body: string,
  options: { contentType?: string; contentLength?: string } = {}
): Request {
  const headers = new Headers({
    'content-type': options.contentType ?? 'application/json',
  });
  if (options.contentLength !== undefined) {
    headers.set('content-length', options.contentLength);
  }
  return new Request('https://example.test/api', {
    method: 'POST',
    headers,
    body,
  });
}

describe('readJsonBody', () => {
  it('parses a JSON body within the limit', async () => {
    const body = await readJsonBody(
      jsonRequest(JSON.stringify({ ok: true })),
      1024
    );
    expect(body).toEqual({ ok: true });
  });

  it('rejects non-json content types', async () => {
    await expect(
      readJsonBody(jsonRequest('{}', { contentType: 'text/plain' }), 1024)
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeError);
  });

  it('rejects oversized content-length before reading', async () => {
    await expect(
      readJsonBody(jsonRequest('{"a":1}', { contentLength: '99999' }), 16)
    ).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it('rejects bodies that grow past the limit while streaming', async () => {
    const payload = 'x'.repeat(64);
    await expect(
      readJsonBody(jsonRequest(`{"v":"${payload}"}`), 32)
    ).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it('rejects invalid JSON', async () => {
    await expect(readJsonBody(jsonRequest('{'), 1024)).rejects.toBeInstanceOf(
      InvalidJsonBodyError
    );
  });
});
