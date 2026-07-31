import 'server-only';

import { desc, eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { contactSubmissions } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';
import { MESSAGES_PAGE_SIZE } from './pagination';

export type ContactSubmissionListItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  read: boolean;
  createdAt: Date;
};

export { MESSAGES_PAGE_SIZE, parseMessagesPage } from './pagination';

export async function getContactSubmissionCounts(): Promise<{
  total: number;
  unread: number;
}> {
  await requireAdmin();
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      unread: sql<number>`count(*) filter (where ${contactSubmissions.read} = false)::int`,
    })
    .from(contactSubmissions);

  return {
    total: row?.total ?? 0,
    unread: row?.unread ?? 0,
  };
}

export async function getContactSubmissions(
  page = 1,
  pageSize = MESSAGES_PAGE_SIZE
): Promise<ContactSubmissionListItem[]> {
  await requireAdmin();
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  return db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      email: contactSubmissions.email,
      subject: contactSubmissions.subject,
      read: contactSubmissions.read,
      createdAt: contactSubmissions.createdAt,
    })
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(safeSize)
    .offset((safePage - 1) * safeSize);
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
