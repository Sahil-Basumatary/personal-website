// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  enforceRateLimit,
  isDistributedRateLimitConfigured,
  __resetRateLimitStoreForTests,
} from './rate-limit';

const config = { windowMs: 1000, max: 3 };

beforeEach(() => {
  __resetRateLimitStoreForTests();
});

describe('checkRateLimit', () => {
  it('allows requests up to the limit and reports remaining', () => {
    expect(checkRateLimit('contact', 'ip', config, 0).remaining).toBe(2);
    expect(checkRateLimit('contact', 'ip', config, 0).remaining).toBe(1);
    expect(checkRateLimit('contact', 'ip', config, 0).remaining).toBe(0);
  });

  it('blocks once the limit is exceeded within the window', () => {
    for (let i = 0; i < config.max; i++) {
      checkRateLimit('contact', 'ip', config, 0);
    }
    const blocked = checkRateLimit('contact', 'ip', config, 500);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets the bucket after the window elapses', () => {
    for (let i = 0; i < config.max; i++) {
      checkRateLimit('contact', 'ip', config, 0);
    }
    const afterReset = checkRateLimit('contact', 'ip', config, config.windowMs);
    expect(afterReset.ok).toBe(true);
    expect(afterReset.remaining).toBe(config.max - 1);
  });

  it('keeps separate buckets per key and namespace', () => {
    checkRateLimit('contact', 'a', config, 0);
    expect(checkRateLimit('contact', 'b', config, 0).remaining).toBe(2);
    expect(checkRateLimit('newsletter', 'a', config, 0).remaining).toBe(2);
  });

  it('forgets expired keys so the store does not retain them', () => {
    checkRateLimit('contact', 'stale', config, 0);
    const afterExpiry = checkRateLimit(
      'contact',
      'fresh',
      config,
      config.windowMs
    );
    expect(afterExpiry.ok).toBe(true);
    expect(
      checkRateLimit('contact', 'stale', config, config.windowMs).remaining
    ).toBe(config.max - 1);
  });
});

describe('enforceRateLimit', () => {
  it('uses memory in Vitest even if Upstash env vars are present', async () => {
    expect(isDistributedRateLimitConfigured()).toBe(false);
    const first = await enforceRateLimit('contact', 'async-ip', config, 0);
    const second = await enforceRateLimit('contact', 'async-ip', config, 0);
    expect(first.remaining).toBe(2);
    expect(second.remaining).toBe(1);
  });
});
