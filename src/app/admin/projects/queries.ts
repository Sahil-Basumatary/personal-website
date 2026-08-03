import 'server-only';

import { asc, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { projectStoryImages, projects } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getSignedStoryImageUrl } from '@/lib/storage/r2';

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

  const imagesWithPreview = await Promise.all(
    imageRows.map(async (image) => {
      if (image.url) {
        return { ...image, previewUrl: image.url };
      }
      try {
        return {
          ...image,
          previewUrl: await getSignedStoryImageUrl(image.storageKey),
        };
      } catch {
        return { ...image, previewUrl: '' };
      }
    })
  );

  const imagesByProject = new Map<
    string,
    (typeof imagesWithPreview)[number][]
  >();
  for (const image of imagesWithPreview) {
    const list = imagesByProject.get(image.projectId) ?? [];
    list.push(image);
    imagesByProject.set(image.projectId, list);
  }

  return projectList.map((project) => ({
    ...project,
    storyImages: imagesByProject.get(project.id) ?? [],
  }));
}
