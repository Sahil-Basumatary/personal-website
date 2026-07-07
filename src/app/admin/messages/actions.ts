'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db';
import { contactSubmissions } from '@/db/schema';
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
): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(formData.get('id'));

  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  revalidatePath('/admin/messages');
  redirect('/admin/messages');
}

export async function markContactSubmissionRead(
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(formData.get('id'));

  await db
    .update(contactSubmissions)
    .set({ read: true })
    .where(eq(contactSubmissions.id, id));
  revalidatePath('/admin/messages');
  revalidatePath(`/admin/messages/${id}`);
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

    await db
      .update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, parsed.data.id));
    revalidatePath('/admin/messages');
    revalidatePath(`/admin/messages/${parsed.data.id}`);

    if (result.skipped) {
      return formSuccess(
        'Reply skipped because RESEND_API_KEY is not configured.'
      );
    }

    return formSuccess('Reply sent.');
  } catch {
    return formError('Reply failed. Check your Resend configuration.');
  }
}
