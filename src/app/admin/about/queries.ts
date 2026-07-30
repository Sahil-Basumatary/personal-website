import 'server-only';

import { db } from '@/db';
import { aboutContent } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';

export interface AboutContentView {
  content: string;
  updatedAt: Date | null;
}

export async function getAboutContent(): Promise<AboutContentView> {
  await requireAdmin();
  const rows = await db.select().from(aboutContent).limit(1);
  const row = rows.at(0);

  return {
    content: row?.content ?? '',
    updatedAt: row?.updatedAt ?? null,
  };
}
