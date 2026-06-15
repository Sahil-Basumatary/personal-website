import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required before using the database.');
  }

  return databaseUrl;
}

const sql = neon(getDatabaseUrl());

export const db = drizzle(sql, { schema });
export type Database = typeof db;
