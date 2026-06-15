'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aboutContent } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';

const MAX_ABOUT_LENGTH = 20000;

export interface AboutFormState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

export async function updateAboutContent(
  _prevState: AboutFormState,
  formData: FormData
): Promise<AboutFormState> {
  await requireAdmin();

  const raw = formData.get('content');

  if (typeof raw !== 'string') {
    return {
      status: 'error',
      message: 'Invalid submission. Please try again.',
    };
  }

  const content = raw.trim();

  if (content.length > MAX_ABOUT_LENGTH) {
    return {
      status: 'error',
      message: `Content must be ${MAX_ABOUT_LENGTH.toLocaleString()} characters or fewer.`,
    };
  }

  // Single-row table: update the existing record in place, otherwise seed it.
  const existing = await db
    .select({ id: aboutContent.id })
    .from(aboutContent)
    .limit(1);

  const current = existing.at(0);

  if (current) {
    await db
      .update(aboutContent)
      .set({ content, updatedAt: new Date() })
      .where(eq(aboutContent.id, current.id));
  } else {
    await db.insert(aboutContent).values({ content });
  }

  revalidatePath('/admin/about');

  return { status: 'success', message: 'About content saved.' };
}
