// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isTrustedAnalyticsRequest } from './request-guard';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isTrustedAnalyticsRequest', () => {
  it('accepts same-origin requests from the site origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.sahilbzy.com');
    const headers = new Headers({
      origin: 'https://www.sahilbzy.com',
      'sec-fetch-site': 'same-origin',
    });
    expect(isTrustedAnalyticsRequest(headers)).toBe(true);
  });

  it('accepts apex when site is www (and the reverse)', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.sahilbzy.com');
    expect(
      isTrustedAnalyticsRequest(
        new Headers({
          origin: 'https://sahilbzy.com',
          'sec-fetch-site': 'same-site',
        })
      )
    ).toBe(true);
  });

  it('rejects cross-site fetch metadata', () => {
    const headers = new Headers({
      origin: 'https://www.sahilbzy.com',
      'sec-fetch-site': 'cross-site',
    });
    expect(isTrustedAnalyticsRequest(headers)).toBe(false);
  });

  it('rejects foreign origins', () => {
    const headers = new Headers({
      origin: 'https://evil.example',
      'sec-fetch-site': 'same-origin',
    });
    expect(isTrustedAnalyticsRequest(headers)).toBe(false);
  });

  it('rejects requests with neither origin nor fetch metadata', () => {
    expect(isTrustedAnalyticsRequest(new Headers())).toBe(false);
  });
});
