import 'server-only';

import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { contactSubmissions } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function getContactSubmissions() {
  await requireAdmin();
  return db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt));
}

export async function getContactSubmission(id: string) {
  await requireAdmin();
  const rows = await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id))
    .limit(1);
  const submission = rows.at(0);

  if (!submission) {
    notFound();
  }

  if (!submission.read) {
    await db
      .update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, id));
    return { ...submission, read: true };
  }

  return submission;
}
