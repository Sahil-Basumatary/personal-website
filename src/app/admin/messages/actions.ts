'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { contactSubmissions } from '@/db/schema';
import { ACTION_FAILURE_MESSAGE } from '@/app/admin/_lib/action-errors';
import {
  type AdminFormState,
  formError,
  formSuccess,
} from '@/app/admin/_lib/form-state';
import { sendContactReply } from '@/lib/email';
import { requireAdmin } from '@/lib/auth/require-admin';

const idSchema = z.uuid();
const replySchema = z.object({
  id: z.uuid(),
  subject: z.string().trim().min(1).max(180),
  message: z.string().trim().min(1).max(8000),
});

export async function deleteContactSubmission(
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));
    if (!id.success) {
      return formError('Invalid message id.');
    }

    await db
      .delete(contactSubmissions)
      .where(eq(contactSubmissions.id, id.data));
    revalidatePath('/admin/messages');

    return formSuccess('Message deleted.');
  } catch {
    return formError(ACTION_FAILURE_MESSAGE);
  }
}

export async function markContactSubmissionRead(
  formData: FormData
): Promise<void> {
  await requireAdmin();

  try {
    const id = idSchema.safeParse(formData.get('id'));
    if (!id.success) {
      return;
    }

    await db
      .update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, id.data));
    revalidatePath('/admin/messages');
    revalidatePath(`/admin/messages/${id.data}`);
  } catch {
    // Leave the row unread so the operator can retry.
  }
}

export async function sendReply(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = replySchema.safeParse({
    id: formData.get('id'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return formError('Check the reply fields and try again.');
  }

  try {
    const submissions = await db
      .select({
        email: contactSubmissions.email,
        name: contactSubmissions.name,
      })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, parsed.data.id))
      .limit(1);
    const submission = submissions.at(0);

    if (!submission) {
      return formError('Message not found.');
    }

    const result = await sendContactReply({
      to: submission.email,
      recipientName: submission.name,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    if (result.skipped) {
      return formError(
        'Reply was not sent because RESEND_API_KEY is not configured.'
      );
    }

    if (!result.sent) {
      return formError('Reply failed. Check your Resend configuration.');
    }

    await db
      .update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, parsed.data.id));
    revalidatePath('/admin/messages');
    revalidatePath(`/admin/messages/${parsed.data.id}`);

    return formSuccess('Reply sent.');
  } catch {
    return formError('Reply failed. Check your Resend configuration.');
  }
}
