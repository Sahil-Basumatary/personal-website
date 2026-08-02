'use server';

import { asc, count, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { projectStoryImages, projects } from '@/db/schema';
import {
  reportActionFailure,
  ACTION_FAILURE_MESSAGE,
} from '@/app/admin/_lib/action-errors';
import {
  type AdminFormState,
  formError,
  formSuccess,
} from '@/app/admin/_lib/form-state';
import { requireAdmin } from '@/lib/auth/require-admin';
import { revalidatePortfolio } from '@/lib/content/revalidate-portfolio';
import { pickAdjacentSwap } from '@/lib/db/adjacent-order';
import { reportServerError } from '@/lib/observability/report-server-error';
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

class StoryImageQuotaError extends Error {
  constructor() {
    super('story-image-quota');
    this.name = 'StoryImageQuotaError';
  }
}

function storageErrorMessage(error: unknown): string {
  if (error instanceof StoryImageQuotaError) {
    return `Each project can have at most ${STORY_IMAGE_MAX_PER_PROJECT} story images.`;
  }
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

    const existingProject = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId.data))
      .limit(1);
    if (!existingProject.at(0)) {
      return formError('That project no longer exists.');
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const uploaded = await putStoryImage({
      projectId: projectId.data,
      bytes,
      mimeType: file.type,
    });

    try {
      await db.transaction(async (tx) => {
        const projectRows = await tx
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.id, projectId.data))
          .for('update')
          .limit(1);

        if (!projectRows.at(0)) {
          throw new Error('project-missing');
        }

        const [{ value: imageCount }] = await tx
          .select({ value: count() })
          .from(projectStoryImages)
          .where(eq(projectStoryImages.projectId, projectId.data));

        if (imageCount >= STORY_IMAGE_MAX_PER_PROJECT) {
          throw new StoryImageQuotaError();
        }

        const orderRows = await tx
          .select({ order: projectStoryImages.order })
          .from(projectStoryImages)
          .where(eq(projectStoryImages.projectId, projectId.data));
        const nextOrder =
          orderRows.reduce((max, row) => Math.max(max, row.order), -1) + 1;

        await tx.insert(projectStoryImages).values({
          projectId: projectId.data,
          storageKey: uploaded.storageKey,
          url: uploaded.url,
          alt: alt.data,
          caption: caption.data,
          order: nextOrder,
        });
      });
    } catch (error) {
      try {
        await deleteStoryImage(uploaded.storageKey);
      } catch {
        // Best-effort cleanup if the DB write fails after upload.
      }
      if (error instanceof Error && error.message === 'project-missing') {
        return formError('That project no longer exists.');
      }
      throw error;
    }

    revalidatePath('/admin/projects');
    revalidatePortfolio();
    return formSuccess('Story image uploaded.');
  } catch (error) {
    if (
      !(
        error instanceof StoryImageStorageError ||
        error instanceof StoryImageQuotaError
      )
    ) {
      reportServerError(error, { scope: 'admin-action:uploadStoryImage' });
    }
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
  } catch (error) {
    return formError(reportActionFailure(error, 'updateStoryImageMeta'));
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

    const swapped = await db.transaction(async (tx) => {
      const currentRows = await tx
        .select({
          id: projectStoryImages.id,
          projectId: projectStoryImages.projectId,
        })
        .from(projectStoryImages)
        .where(eq(projectStoryImages.id, id.data))
        .limit(1);
      const current = currentRows[0];
      if (!current) {
        return false;
      }

      const ordered = await tx
        .select({
          id: projectStoryImages.id,
          order: projectStoryImages.order,
        })
        .from(projectStoryImages)
        .where(eq(projectStoryImages.projectId, current.projectId))
        .orderBy(
          asc(projectStoryImages.order),
          asc(projectStoryImages.createdAt)
        )
        .for('update');

      const pair = pickAdjacentSwap(ordered, current.id, direction.data);
      if (!pair) {
        return false;
      }

      const now = new Date();
      await tx
        .update(projectStoryImages)
        .set({ order: pair.target.order, updatedAt: now })
        .where(eq(projectStoryImages.id, pair.current.id));
      await tx
        .update(projectStoryImages)
        .set({ order: pair.current.order, updatedAt: now })
        .where(eq(projectStoryImages.id, pair.target.id));
      return true;
    });

    if (!swapped) {
      return;
    }

    revalidatePath('/admin/projects');
    revalidatePortfolio();
  } catch (error) {
    reportServerError(error, { scope: 'admin-action:reorderStoryImage' });
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
    if (!(error instanceof StoryImageStorageError)) {
      reportServerError(error, {
        scope: 'admin-action:deleteStoryImageRecord',
      });
    }
    return formError(storageErrorMessage(error));
  }
}
