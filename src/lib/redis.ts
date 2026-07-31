import { createClient, type RedisClientType } from 'redis';

type ConnectedRedis = RedisClientType;

let clientPromise: Promise<ConnectedRedis> | null = null;

export function isRedisConfigured(): boolean {
  if (process.env.RATE_LIMIT_FORCE_MEMORY === '1') {
    return false;
  }
  if (process.env.VITEST) {
    return false;
  }
  return Boolean(process.env.REDIS_URL?.trim());
}

export async function getRedisClient(): Promise<ConnectedRedis | null> {
  if (!isRedisConfigured()) {
    return null;
  }

  if (!clientPromise) {
    const url = process.env.REDIS_URL!.trim();
    const client = createClient({ url });
    client.on('error', () => {
      // Connection errors are handled by callers; avoid unhandled 'error' crashes.
    });
    clientPromise = client
      .connect()
      .then(() => client as ConnectedRedis)
      .catch((error: unknown) => {
        clientPromise = null;
        throw error;
      });
  }

  return clientPromise;
}

export function __resetRedisClientForTests(): void {
  clientPromise = null;
}
