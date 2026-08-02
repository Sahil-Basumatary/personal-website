import 'server-only';

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { requireDatabaseUrl } from './database-url';
import * as schema from './schema';

export { DatabaseConfigError, requireDatabaseUrl } from './database-url';

neonConfig.webSocketConstructor = ws;

export type Database = NeonDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  __portfolioDbPool?: Pool;
  __portfolioDb?: Database;
};

function getPool(): Pool {
  if (!globalForDb.__portfolioDbPool) {
    globalForDb.__portfolioDbPool = new Pool({
      connectionString: requireDatabaseUrl(),
    });
  }
  return globalForDb.__portfolioDbPool;
}

export function getDb(): Database {
  if (!globalForDb.__portfolioDb) {
    globalForDb.__portfolioDb = drizzle(getPool(), { schema });
  }
  return globalForDb.__portfolioDb;
}

// Lazy: importing this module must not open a pool or require DATABASE_URL.
export const db: Database = new Proxy({} as Database, {
  get(_target, property, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance as object, property, receiver);
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});
