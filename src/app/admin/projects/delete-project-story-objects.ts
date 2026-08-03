import 'server-only';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { projectStoryImages } from '@/db/schema';
import { deleteStoryImageDurable } from '@/lib/storage/deletion-tombstones';
import { publicObjectKeyForStoryImage } from '@/lib/storage/story-image-limits';

const projectIdSchema = z.uuid();

export async function deleteProjectStoryObjects(
  projectId: string
): Promise<void> {
  const parsed = projectIdSchema.safeParse(projectId);
  if (!parsed.success) {
    throw new Error('Invalid project id.');
  }

  const rows = await db
    .select({ storageKey: projectStoryImages.storageKey })
    .from(projectStoryImages)
    .where(eq(projectStoryImages.projectId, parsed.data));

  for (const row of rows) {
    await deleteStoryImageDurable(db, row.storageKey);
    await deleteStoryImageDurable(
      db,
      publicObjectKeyForStoryImage(row.storageKey)
    );
  }
}
