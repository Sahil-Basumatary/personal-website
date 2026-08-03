import 'server-only';

import { eq } from 'drizzle-orm';
import type { Database } from '@/db';
import { projectStoryImages } from '@/db/schema';
import { deleteStoryImageDurable } from '@/lib/storage/deletion-tombstones';
import {
  demoteStoryImageFromPublic,
  promoteStoryImageToPublic,
} from '@/lib/storage/r2';
import { publicObjectKeyForStoryImage } from '@/lib/storage/story-image-limits';

export async function publishProjectStoryImages(
  database: Database,
  projectId: string
): Promise<void> {
  const rows = await database
    .select({
      id: projectStoryImages.id,
      storageKey: projectStoryImages.storageKey,
      url: projectStoryImages.url,
    })
    .from(projectStoryImages)
    .where(eq(projectStoryImages.projectId, projectId));

  for (const row of rows) {
    if (row.url) {
      continue;
    }
    const url = await promoteStoryImageToPublic(row.storageKey);
    await database
      .update(projectStoryImages)
      .set({ url, updatedAt: new Date() })
      .where(eq(projectStoryImages.id, row.id));
  }
}

export async function unpublishProjectStoryImages(
  database: Database,
  projectId: string
): Promise<void> {
  const rows = await database
    .select({
      id: projectStoryImages.id,
      storageKey: projectStoryImages.storageKey,
    })
    .from(projectStoryImages)
    .where(eq(projectStoryImages.projectId, projectId));

  if (rows.length === 0) {
    return;
  }

  await database
    .update(projectStoryImages)
    .set({ url: null, updatedAt: new Date() })
    .where(eq(projectStoryImages.projectId, projectId));

  for (const row of rows) {
    try {
      await demoteStoryImageFromPublic(row.storageKey);
    } catch {
      await deleteStoryImageDurable(
        database,
        publicObjectKeyForStoryImage(row.storageKey)
      );
    }
  }
}
