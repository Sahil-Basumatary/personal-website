'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aboutContent } from '@/db/schema';
import { reportActionFailure } from '@/app/admin/_lib/action-errors';
import {
  type AdminFormState,
  formError,
  formSuccess,
} from '@/app/admin/_lib/form-state';
import { requireAdmin } from '@/lib/auth/require-admin';
import { ABOUT_SINGLETON_KEY } from '@/lib/content/about-singleton';
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

    await db
      .insert(aboutContent)
      .values({
        singletonKey: ABOUT_SINGLETON_KEY,
        content,
      })
      .onConflictDoUpdate({
        target: aboutContent.singletonKey,
        set: {
          content,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/admin/about');
    revalidatePortfolio();

    return formSuccess('About content saved.');
  } catch (error) {
    return formError(reportActionFailure(error, 'updateAboutContent'));
  }
}
