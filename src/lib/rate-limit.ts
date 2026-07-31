import { getRedisClient, isRedisConfigured } from '@/lib/redis';

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

// Atomic fixed-window: INCR + set TTL only on first hit in the window.
const FIXED_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], tonumber(ARGV[1]))
end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`;

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
  return isRedisConfigured();
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

async function checkRedisRateLimit(
  namespace: string,
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitResult> {
  const client = await getRedisClient();
  if (!client) {
    return checkRateLimit(namespace, key, config, now);
  }

  const redisKey = `portfolio:rl:${namespace}:${key}`;
  const raw = (await client.eval(FIXED_WINDOW_SCRIPT, {
    keys: [redisKey],
    arguments: [String(config.windowMs)],
  })) as [number | string, number | string];

  const count = Number(raw[0]);
  const ttlMs = Number(raw[1]);
  const resetAt = ttlMs > 0 ? now + ttlMs : now + config.windowMs;

  if (count > config.max) {
    return { ok: false, remaining: 0, resetAt };
  }

  return {
    ok: true,
    remaining: Math.max(0, config.max - count),
    resetAt,
  };
}

export async function enforceRateLimit(
  namespace: string,
  key: string,
  config: RateLimitConfig,
  now: number = Date.now()
): Promise<RateLimitResult> {
  if (!isDistributedRateLimitConfigured()) {
    return checkRateLimit(namespace, key, config, now);
  }

  try {
    return await checkRedisRateLimit(namespace, key, config, now);
  } catch {
    // Redis outage must not take public routes offline — degrade to local buckets.
    return checkRateLimit(namespace, key, config, now);
  }
}

export function __resetRateLimitStoreForTests(): void {
  stores.clear();
}
