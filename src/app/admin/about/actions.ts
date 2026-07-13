'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aboutContent } from '@/db/schema';
import { ACTION_FAILURE_MESSAGE } from '@/app/admin/_lib/action-errors';
import {
  type AdminFormState,
  formError,
  formSuccess,
} from '@/app/admin/_lib/form-state';
import { requireAdmin } from '@/lib/auth/require-admin';
import { revalidatePortfolio } from '@/lib/content/revalidate-portfolio';

const MAX_ABOUT_LENGTH = 20000;

export async function updateAboutContent(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const raw = formData.get('content');

    if (typeof raw !== 'string') {
      return formError('Invalid submission. Please try again.');
    }

    const content = raw.trim();

    if (content.length > MAX_ABOUT_LENGTH) {
      return formError(
        `Content must be ${MAX_ABOUT_LENGTH.toLocaleString()} characters or fewer.`
      );
    }

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
    revalidatePortfolio();

    return formSuccess('About content saved.');
  } catch {
    return formError(ACTION_FAILURE_MESSAGE);
  }
}
