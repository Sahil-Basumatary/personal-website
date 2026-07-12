import 'server-only';

import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { aboutContent, projects, skills } from '@/db/schema';
import type { ProjectRecord, SkillRecord } from './map-portfolio';
import type { PortfolioSnapshot } from './portfolio-loader';

export async function fetchPublicPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const [aboutRows, projectRows, skillRows] = await Promise.all([
    db.select({ content: aboutContent.content }).from(aboutContent).limit(1),
    db
      .select({
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
      })
      .from(skills)
      .orderBy(asc(skills.order), asc(skills.name)),
  ]);

  return {
    about: aboutRows.at(0)?.content ?? null,
    projects: projectRows as ProjectRecord[],
    skills: skillRows as SkillRecord[],
  };
}
