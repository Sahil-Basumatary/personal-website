import 'server-only';

import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  aboutContent,
  projectStoryImages,
  projects,
  skills,
} from '@/db/schema';
import type { ProjectRecord, SkillRecord } from './map-portfolio';
import type { PortfolioSnapshot } from './portfolio-loader';
import type { PortfolioStoryImage } from '@/types/portfolio';

export async function fetchPublicPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const [aboutRows, projectRows, skillRows] = await Promise.all([
    db.select({ content: aboutContent.content }).from(aboutContent).limit(1),
    db
      .select({
        id: projects.id,
        slug: projects.slug,
        title: projects.title,
        summary: projects.summary,
        readme: projects.readme,
        techStack: projects.techStack,
        liveUrl: projects.liveUrl,
        githubUrl: projects.githubUrl,
        status: projects.status,
        order: projects.order,
      })
      .from(projects)
      .where(eq(projects.status, 'published'))
      .orderBy(asc(projects.order), asc(projects.title)),
    db
      .select({
        name: skills.name,
        category: skills.category,
        order: skills.order,
        proficiency: skills.proficiency,
      })
      .from(skills)
      .orderBy(asc(skills.order), asc(skills.name)),
  ]);

  const projectIds = projectRows.map((row) => row.id);
  const imageRows =
    projectIds.length === 0
      ? []
      : await db
          .select({
            projectId: projectStoryImages.projectId,
            url: projectStoryImages.url,
            alt: projectStoryImages.alt,
            caption: projectStoryImages.caption,
            order: projectStoryImages.order,
          })
          .from(projectStoryImages)
          .where(inArray(projectStoryImages.projectId, projectIds))
          .orderBy(asc(projectStoryImages.order));

  const imagesByProject = new Map<string, PortfolioStoryImage[]>();
  for (const row of imageRows) {
    const list = imagesByProject.get(row.projectId) ?? [];
    list.push({
      url: row.url,
      alt: row.alt,
      caption: row.caption,
      order: row.order,
    });
    imagesByProject.set(row.projectId, list);
  }

  return {
    about: aboutRows.at(0)?.content ?? null,
    projects: projectRows.map(
      ({ id, ...project }): ProjectRecord => ({
        ...project,
        images: imagesByProject.get(id) ?? [],
      })
    ),
    skills: skillRows as SkillRecord[],
  };
}
