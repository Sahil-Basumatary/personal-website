import { PROJECT_STORY_FILENAME } from '@/lib/content/build-system-drive';

/** `/Desktop/Projects/<slug>/About this project` (and nested equivalents). */
export function isProjectStoryPath(path: string): boolean {
  return projectSlugFromStoryPath(path) !== null;
}

export function projectSlugFromStoryPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  if (segments.length < 3) return null;
  if (segments[segments.length - 1] !== PROJECT_STORY_FILENAME) return null;

  const projectsIndex = segments.lastIndexOf('Projects');
  if (projectsIndex < 0) return null;
  if (segments[projectsIndex + 2] !== PROJECT_STORY_FILENAME) return null;

  const slug = segments[projectsIndex + 1];
  if (!slug || slug === PROJECT_STORY_FILENAME) return null;
  return slug;
}
