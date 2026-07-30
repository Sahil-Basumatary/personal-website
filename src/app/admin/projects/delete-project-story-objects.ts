import 'server-only';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { projectStoryImages } from '@/db/schema';
import { deleteStoryImage } from '@/lib/storage/r2';

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
    try {
      await deleteStoryImage(row.storageKey);
    } catch {
      // Cascade still removes DB rows; continue best-effort R2 cleanup.
    }
  }
}
