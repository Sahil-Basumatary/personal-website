import { sql } from 'drizzle-orm';
import type { Database } from '@/db';
import {
  getMigrationManifest,
  type MigrationManifest,
} from '@/lib/db/migration-manifest';

export type MigrationReadiness =
  | {
      ok: true;
      expected: number;
      applied: number;
      latestTag: string;
    }
  | {
      ok: false;
      expected: number;
      applied: number;
      latestTag: string;
      reason: 'behind' | 'unavailable';
    };

export async function getAppliedMigrationCount(
  database: Database
): Promise<number> {
  const result = await database.execute<{ count: number }>(sql`
    select count(*)::int as count
    from drizzle.__drizzle_migrations
  `);
  const rows = 'rows' in result ? result.rows : result;
  const first = Array.isArray(rows) ? rows[0] : undefined;
  return Number(first?.count ?? 0);
}

export async function checkMigrationReadiness(
  database: Database,
  manifest: MigrationManifest = getMigrationManifest()
): Promise<MigrationReadiness> {
  try {
    const applied = await getAppliedMigrationCount(database);
    if (applied < manifest.expectedCount) {
      return {
        ok: false,
        expected: manifest.expectedCount,
        applied,
        latestTag: manifest.latestTag,
        reason: 'behind',
      };
    }
    return {
      ok: true,
      expected: manifest.expectedCount,
      applied,
      latestTag: manifest.latestTag,
    };
  } catch {
    return {
      ok: false,
      expected: manifest.expectedCount,
      applied: 0,
      latestTag: manifest.latestTag,
      reason: 'unavailable',
    };
  }
}
