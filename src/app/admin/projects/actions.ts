'use server';

import { and, asc, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { ACTION_FAILURE_MESSAGE } from '@/app/admin/_lib/action-errors';
import {
  type AdminFormState,
  formError,
  formSuccess,
} from '@/app/admin/_lib/form-state';
import { requireAdmin } from '@/lib/auth/require-admin';
import { revalidatePortfolio } from '@/lib/content/revalidate-portfolio';
import { pickAdjacentSwap } from '@/lib/db/adjacent-order';
import { deleteProjectStoryObjects } from './delete-project-story-objects';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .pipe(z.url().nullable());

const projectSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(10),
  readme: z.string().trim().min(10),
  techStack: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().min(1).max(40)).max(20)),
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  status: z.enum(['draft', 'published', 'archived']),
});

const idSchema = z.uuid();
const directionSchema = z.enum(['up', 'down']);

function parseProject(formData: FormData) {
  return projectSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    summary: formData.get('summary'),
    readme: formData.get('readme'),
    techStack: formData.get('techStack'),
    liveUrl: formData.get('liveUrl'),
    githubUrl: formData.get('githubUrl'),
    status: formData.get('status'),
  });
}

async function isSlugTaken(slug: string, currentId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      currentId
        ? and(eq(projects.slug, slug), ne(projects.id, currentId))
        : eq(projects.slug, slug)
    )
    .limit(1);

  return rows.length > 0;
}

async function getNextProjectOrder(): Promise<number> {
  const rows = await db.select({ order: projects.order }).from(projects);
  return rows.reduce((max, row) => Math.max(max, row.order), -1) + 1;
}

export async function createProject(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const parsed = parseProject(formData);

    if (!parsed.success) {
      return formError('Check the project fields and try again.');
    }

    if (await isSlugTaken(parsed.data.slug)) {
      return formError('That project slug is already in use.');
    }

    await db.insert(projects).values({
      ...parsed.data,
      order: await getNextProjectOrder(),
    });

    revalidatePath('/admin/projects');
    revalidatePortfolio();

    return formSuccess('Project created.');
  } catch {
    return formError(ACTION_FAILURE_MESSAGE);
  }
}

export async function updateProject(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));

    if (!id.success) {
      return formError('Invalid project id.');
    }

    const parsed = parseProject(formData);

    if (!parsed.success) {
      return formError('Check the project fields and try again.');
    }

    if (await isSlugTaken(parsed.data.slug, id.data)) {
      return formError('That project slug is already in use.');
    }

    await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, id.data));

    revalidatePath('/admin/projects');
    revalidatePortfolio();

    return formSuccess('Project updated.');
  } catch {
    return formError(ACTION_FAILURE_MESSAGE);
  }
}

export async function deleteProject(
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));
    if (!id.success) {
      return formError('Invalid project id.');
    }

    await deleteProjectStoryObjects(id.data);
    await db.delete(projects).where(eq(projects.id, id.data));
    revalidatePath('/admin/projects');
    revalidatePortfolio();

    return formSuccess('Project deleted.');
  } catch {
    return formError(ACTION_FAILURE_MESSAGE);
  }
}

export async function reorderProject(formData: FormData): Promise<void> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));
    const direction = directionSchema.safeParse(formData.get('direction'));
    if (!id.success || !direction.success) {
      return;
    }

    const swapped = await db.transaction(async (tx) => {
      const ordered = await tx
        .select({ id: projects.id, order: projects.order })
        .from(projects)
        .orderBy(asc(projects.order), asc(projects.createdAt))
        .for('update');
      const pair = pickAdjacentSwap(ordered, id.data, direction.data);
      if (!pair) {
        return false;
      }

      const now = new Date();
      await tx
        .update(projects)
        .set({ order: pair.target.order, updatedAt: now })
        .where(eq(projects.id, pair.current.id));
      await tx
        .update(projects)
        .set({ order: pair.current.order, updatedAt: now })
        .where(eq(projects.id, pair.target.id));
      return true;
    });

    if (!swapped) {
      return;
    }

    revalidatePath('/admin/projects');
    revalidatePortfolio();
  } catch {
    // Keep the list usable; the next refresh shows the last known order.
  }
}
