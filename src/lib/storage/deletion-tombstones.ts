import 'server-only';

import { asc, eq, lt, sql } from 'drizzle-orm';
import type { Database } from '@/db';
import { storageDeletionTombstones } from '@/db/schema';
import { deleteStoryImage } from '@/lib/storage/r2';
import {
  STORAGE_TOMBSTONE_BATCH_SIZE,
  STORAGE_TOMBSTONE_MAX_ATTEMPTS,
} from '@/lib/storage/storage-tombstone-policy';

export {
  STORAGE_TOMBSTONE_BATCH_SIZE,
  STORAGE_TOMBSTONE_MAX_ATTEMPTS,
} from '@/lib/storage/storage-tombstone-policy';

export async function recordStorageDeletionFailure(
  database: Database,
  storageKey: string,
  error: unknown
): Promise<void> {
  const message =
    error instanceof Error ? error.message.slice(0, 500) : 'delete_failed';
  const now = new Date();

  await database
    .insert(storageDeletionTombstones)
    .values({
      storageKey,
      attempts: 1,
      lastError: message,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: storageDeletionTombstones.storageKey,
      set: {
        attempts: sql`${storageDeletionTombstones.attempts} + 1`,
        lastError: message,
        updatedAt: now,
      },
    });
}

export async function deleteStoryImageDurable(
  database: Database,
  storageKey: string
): Promise<void> {
  try {
    await deleteStoryImage(storageKey);
    await database
      .delete(storageDeletionTombstones)
      .where(eq(storageDeletionTombstones.storageKey, storageKey));
  } catch (error) {
    await recordStorageDeletionFailure(database, storageKey, error);
  }
}

export interface TombstoneRetryResult {
  attempted: number;
  deleted: number;
  failed: number;
}

export async function retryStorageDeletionTombstones(
  database: Database,
  options: {
    limit?: number;
    maxAttempts?: number;
  } = {}
): Promise<TombstoneRetryResult> {
  const limit = options.limit ?? STORAGE_TOMBSTONE_BATCH_SIZE;
  const maxAttempts = options.maxAttempts ?? STORAGE_TOMBSTONE_MAX_ATTEMPTS;

  const rows = await database
    .select({
      id: storageDeletionTombstones.id,
      storageKey: storageDeletionTombstones.storageKey,
      attempts: storageDeletionTombstones.attempts,
    })
    .from(storageDeletionTombstones)
    .where(lt(storageDeletionTombstones.attempts, maxAttempts))
    .orderBy(asc(storageDeletionTombstones.updatedAt))
    .limit(limit);

  let deleted = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await deleteStoryImage(row.storageKey);
      await database
        .delete(storageDeletionTombstones)
        .where(eq(storageDeletionTombstones.id, row.id));
      deleted += 1;
    } catch (error) {
      failed += 1;
      const message =
        error instanceof Error ? error.message.slice(0, 500) : 'delete_failed';
      await database
        .update(storageDeletionTombstones)
        .set({
          attempts: row.attempts + 1,
          lastError: message,
          updatedAt: new Date(),
        })
        .where(eq(storageDeletionTombstones.id, row.id));
    }
  }

  return {
    attempted: rows.length,
    deleted,
    failed,
  };
}
