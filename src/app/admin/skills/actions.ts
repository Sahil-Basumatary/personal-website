'use server';

import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { skills } from '@/db/schema';
import {
  type AdminFormState,
  formError,
  formSuccess,
} from '@/app/admin/_lib/form-state';
import { requireAdmin } from '@/lib/auth/require-admin';

const skillSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  proficiency: z.coerce.number().int().min(0).max(100),
});

const idSchema = z.uuid();
const directionSchema = z.enum(['up', 'down']);

function parseSkill(formData: FormData) {
  return skillSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    proficiency: formData.get('proficiency'),
  });
}

async function getNextSkillOrder(): Promise<number> {
  const rows = await db.select({ order: skills.order }).from(skills);
  return rows.reduce((max, row) => Math.max(max, row.order), -1) + 1;
}

export async function createSkill(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = parseSkill(formData);

  if (!parsed.success) {
    return formError('Check the skill fields and try again.');
  }

  await db.insert(skills).values({
    ...parsed.data,
    order: await getNextSkillOrder(),
  });

  revalidatePath('/admin/skills');

  return formSuccess('Skill created.');
}

export async function updateSkill(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const id = idSchema.safeParse(formData.get('id'));

  if (!id.success) {
    return formError('Invalid skill id.');
  }

  const parsed = parseSkill(formData);

  if (!parsed.success) {
    return formError('Check the skill fields and try again.');
  }

  await db.update(skills).set(parsed.data).where(eq(skills.id, id.data));

  revalidatePath('/admin/skills');

  return formSuccess('Skill updated.');
}

export async function deleteSkill(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(formData.get('id'));

  await db.delete(skills).where(eq(skills.id, id));
  revalidatePath('/admin/skills');
}

export async function reorderSkill(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(formData.get('id'));
  const direction = directionSchema.parse(formData.get('direction'));
  const ordered = await db
    .select({ id: skills.id, order: skills.order })
    .from(skills)
    .orderBy(asc(skills.order), asc(skills.name));
  const currentIndex = ordered.findIndex((skill) => skill.id === id);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  const current = ordered[currentIndex];
  const target = ordered[targetIndex];

  if (!current || !target) {
    return;
  }

  await db
    .update(skills)
    .set({ order: target.order })
    .where(eq(skills.id, current.id));
  await db
    .update(skills)
    .set({ order: current.order })
    .where(eq(skills.id, target.id));

  revalidatePath('/admin/skills');
}
