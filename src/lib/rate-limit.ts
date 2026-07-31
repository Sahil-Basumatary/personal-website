import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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

const stores = new Map<string, Map<string, Bucket>>();
const redisLimiters = new Map<string, Ratelimit>();

function getStore(namespace: string): Map<string, Bucket> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

function pruneExpired(store: Map<string, Bucket>, now: number): void {
  for (const [key, bucket] of store) {
    if (now >= bucket.resetAt) {
      store.delete(key);
    }
  }
}

export function isDistributedRateLimitConfigured(): boolean {
  if (process.env.RATE_LIMIT_FORCE_MEMORY === '1') {
    return false;
  }
  if (process.env.VITEST) {
    return false;
  }
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export function checkRateLimit(
  namespace: string,
  key: string,
  config: RateLimitConfig,
  now: number = Date.now()
): RateLimitResult {
  const store = getStore(namespace);
  pruneExpired(store, now);
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

function getRedisLimiter(
  namespace: string,
  config: RateLimitConfig
): Ratelimit | null {
  if (!isDistributedRateLimitConfigured()) {
    return null;
  }

  const cacheKey = `${namespace}:${config.max}:${config.windowMs}`;
  let limiter = redisLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(config.max, `${config.windowMs} ms`),
      prefix: `portfolio:rl:${namespace}`,
      analytics: false,
    });
    redisLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function enforceRateLimit(
  namespace: string,
  key: string,
  config: RateLimitConfig,
  now: number = Date.now()
): Promise<RateLimitResult> {
  const limiter = getRedisLimiter(namespace, config);
  if (!limiter) {
    return checkRateLimit(namespace, key, config, now);
  }

  try {
    const result = await limiter.limit(key);
    return {
      ok: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch {
    // Redis outage must not take public routes offline — degrade to local buckets.
    return checkRateLimit(namespace, key, config, now);
  }
}

export function __resetRateLimitStoreForTests(): void {
  stores.clear();
  redisLimiters.clear();
}
