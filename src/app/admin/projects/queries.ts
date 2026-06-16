import 'server-only';

import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { projects } from '@/db/schema';

export async function getProjects() {
  return db
    .select()
    .from(projects)
    .orderBy(asc(projects.order), asc(projects.createdAt));
}
