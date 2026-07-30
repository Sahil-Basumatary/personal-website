import 'server-only';

import { asc, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { projectStoryImages, projects } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function getProjects() {
  await requireAdmin();
  const projectList = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.order), asc(projects.createdAt));

  const projectIds = projectList.map((project) => project.id);
  const imageRows =
    projectIds.length === 0
      ? []
      : await db
          .select()
          .from(projectStoryImages)
          .where(inArray(projectStoryImages.projectId, projectIds))
          .orderBy(
            asc(projectStoryImages.order),
            asc(projectStoryImages.createdAt)
          );

  const imagesByProject = new Map<string, (typeof imageRows)[number][]>();
  for (const image of imageRows) {
    const list = imagesByProject.get(image.projectId) ?? [];
    list.push(image);
    imagesByProject.set(image.projectId, list);
  }

  return projectList.map((project) => ({
    ...project,
    storyImages: imagesByProject.get(project.id) ?? [],
  }));
}
