'use server';

import { asc, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { projectStoryImages, projects } from '@/db/schema';
import { ACTION_FAILURE_MESSAGE } from '@/app/admin/_lib/action-errors';
import {
  type AdminFormState,
  formError,
  formSuccess,
} from '@/app/admin/_lib/form-state';
import { requireAdmin } from '@/lib/auth/require-admin';
import { revalidatePortfolio } from '@/lib/content/revalidate-portfolio';
import {
  StoryImageStorageError,
  deleteStoryImage,
  putStoryImage,
} from '@/lib/storage/r2';
import { STORY_IMAGE_MAX_PER_PROJECT } from '@/lib/storage/story-image-limits';

const idSchema = z.uuid();
const directionSchema = z.enum(['up', 'down']);
const altSchema = z.string().trim().min(1).max(240);
const captionSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value ? value : null));

function storageErrorMessage(error: unknown): string {
  if (!(error instanceof StoryImageStorageError)) {
    return ACTION_FAILURE_MESSAGE;
  }
  switch (error.code) {
    case 'misconfigured':
      return 'Image storage is not configured. Check R2 environment variables.';
    case 'unsupported_type':
      return 'Only JPEG, PNG, and WebP images are allowed.';
    case 'too_large':
      return 'Images must be 2MB or smaller.';
    case 'empty':
      return 'Choose an image file to upload.';
    default:
      return ACTION_FAILURE_MESSAGE;
  }
}

async function projectExists(projectId: string): Promise<boolean> {
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return rows.length > 0;
}

async function nextImageOrder(projectId: string): Promise<number> {
  const rows = await db
    .select({ order: projectStoryImages.order })
    .from(projectStoryImages)
    .where(eq(projectStoryImages.projectId, projectId));
  return rows.reduce((max, row) => Math.max(max, row.order), -1) + 1;
}

export async function uploadStoryImage(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const projectId = idSchema.safeParse(formData.get('projectId'));
    const alt = altSchema.safeParse(formData.get('alt'));
    const caption = captionSchema.safeParse(formData.get('caption') ?? '');
    const file = formData.get('file');

    if (!projectId.success) {
      return formError('Invalid project id.');
    }
    if (!alt.success) {
      return formError('Alt text is required (1–240 characters).');
    }
    if (!caption.success) {
      return formError('Caption must be 500 characters or fewer.');
    }
    if (!(file instanceof File)) {
      return formError('Choose an image file to upload.');
    }
    if (!(await projectExists(projectId.data))) {
      return formError('That project no longer exists.');
    }

    const [{ value: imageCount }] = await db
      .select({ value: count() })
      .from(projectStoryImages)
      .where(eq(projectStoryImages.projectId, projectId.data));

    if (imageCount >= STORY_IMAGE_MAX_PER_PROJECT) {
      return formError(
        `Each project can have at most ${STORY_IMAGE_MAX_PER_PROJECT} story images.`
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const uploaded = await putStoryImage({
      projectId: projectId.data,
      bytes,
      mimeType: file.type,
    });

    try {
      await db.insert(projectStoryImages).values({
        projectId: projectId.data,
        storageKey: uploaded.storageKey,
        url: uploaded.url,
        alt: alt.data,
        caption: caption.data,
        order: await nextImageOrder(projectId.data),
      });
    } catch (error) {
      try {
        await deleteStoryImage(uploaded.storageKey);
      } catch {
        // Best-effort cleanup if the DB write fails after upload.
      }
      throw error;
    }

    revalidatePath('/admin/projects');
    revalidatePortfolio();
    return formSuccess('Story image uploaded.');
  } catch (error) {
    return formError(storageErrorMessage(error));
  }
}

export async function updateStoryImageMeta(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));
    const alt = altSchema.safeParse(formData.get('alt'));
    const caption = captionSchema.safeParse(formData.get('caption') ?? '');

    if (!id.success) {
      return formError('Invalid image id.');
    }
    if (!alt.success) {
      return formError('Alt text is required (1–240 characters).');
    }
    if (!caption.success) {
      return formError('Caption must be 500 characters or fewer.');
    }

    const updated = await db
      .update(projectStoryImages)
      .set({
        alt: alt.data,
        caption: caption.data,
        updatedAt: new Date(),
      })
      .where(eq(projectStoryImages.id, id.data))
      .returning({ id: projectStoryImages.id });

    if (updated.length === 0) {
      return formError('That image no longer exists.');
    }

    revalidatePath('/admin/projects');
    revalidatePortfolio();
    return formSuccess('Image details saved.');
  } catch {
    return formError(ACTION_FAILURE_MESSAGE);
  }
}

export async function reorderStoryImage(formData: FormData): Promise<void> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));
    const direction = directionSchema.safeParse(formData.get('direction'));
    if (!id.success || !direction.success) {
      return;
    }

    const currentRows = await db
      .select({
        id: projectStoryImages.id,
        projectId: projectStoryImages.projectId,
        order: projectStoryImages.order,
      })
      .from(projectStoryImages)
      .where(eq(projectStoryImages.id, id.data))
      .limit(1);
    const current = currentRows[0];
    if (!current) return;

    const ordered = await db
      .select({
        id: projectStoryImages.id,
        order: projectStoryImages.order,
      })
      .from(projectStoryImages)
      .where(eq(projectStoryImages.projectId, current.projectId))
      .orderBy(
        asc(projectStoryImages.order),
        asc(projectStoryImages.createdAt)
      );

    const currentIndex = ordered.findIndex((row) => row.id === current.id);
    const targetIndex =
      direction.data === 'up' ? currentIndex - 1 : currentIndex + 1;
    const target = ordered[targetIndex];
    if (!target) return;

    await db
      .update(projectStoryImages)
      .set({ order: target.order, updatedAt: new Date() })
      .where(eq(projectStoryImages.id, current.id));
    await db
      .update(projectStoryImages)
      .set({ order: current.order, updatedAt: new Date() })
      .where(eq(projectStoryImages.id, target.id));

    revalidatePath('/admin/projects');
    revalidatePortfolio();
  } catch {
    // Keep the editor usable; refresh shows last known order.
  }
}

export async function deleteStoryImageRecord(
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));
    if (!id.success) {
      return formError('Invalid image id.');
    }

    const rows = await db
      .select({
        id: projectStoryImages.id,
        storageKey: projectStoryImages.storageKey,
      })
      .from(projectStoryImages)
      .where(eq(projectStoryImages.id, id.data))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return formError('That image no longer exists.');
    }

    await db
      .delete(projectStoryImages)
      .where(eq(projectStoryImages.id, row.id));

    try {
      await deleteStoryImage(row.storageKey);
    } catch {
      // DB row is gone; orphaned R2 object can be cleaned later.
    }

    revalidatePath('/admin/projects');
    revalidatePortfolio();
    return formSuccess('Story image deleted.');
  } catch (error) {
    return formError(storageErrorMessage(error));
  }
}
