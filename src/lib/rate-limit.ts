interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

// Process-local store. Acceptable for a portfolio: per-instance buckets are
// fine when the threat model is casual spam, not coordinated abuse. Phase 7
// migrates to Vercel KV so limits hold across cold starts and regions.
const stores = new Map<string, Map<string, Bucket>>();

function getStore(namespace: string): Map<string, Bucket> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export function checkRateLimit(
  namespace: string,
  key: string,
  config: RateLimitConfig,
  now: number = Date.now()
): RateLimitResult {
  const store = getStore(namespace);
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const fresh: Bucket = { count: 1, resetAt: now + config.windowMs };
    store.set(key, fresh);
    return {
      ok: true,
      remaining: config.max - 1,
      resetAt: fresh.resetAt,
    };
  }

  if (existing.count >= config.max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: config.max - existing.count,
    resetAt: existing.resetAt,
  };
}

export function __resetRateLimitStoreForTests(): void {
  stores.clear();
}
