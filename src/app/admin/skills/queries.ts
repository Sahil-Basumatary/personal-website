import 'server-only';

import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { skills } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function getSkills() {
  await requireAdmin();
  return db.select().from(skills).orderBy(asc(skills.order), asc(skills.name));
}
