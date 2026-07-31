import 'server-only';

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

neonConfig.webSocketConstructor = ws;

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required before using the database.');
  }

  return databaseUrl;
}

const globalForDb = globalThis as typeof globalThis & {
  __portfolioDbPool?: Pool;
};

function getPool(): Pool {
  if (!globalForDb.__portfolioDbPool) {
    globalForDb.__portfolioDbPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }
  return globalForDb.__portfolioDbPool;
}

export const db = drizzle(getPool(), { schema });
export type Database = typeof db;
