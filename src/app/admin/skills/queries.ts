import 'server-only';

import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { skills } from '@/db/schema';

export async function getSkills() {
  return db.select().from(skills).orderBy(asc(skills.order), asc(skills.name));
}
