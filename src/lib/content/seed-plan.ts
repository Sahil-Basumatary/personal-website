import type { PortfolioContent, PortfolioProject } from '@/types/portfolio';

export const DEFAULT_SEED_SKILL_PROFICIENCY = 70;

export type SeedSkillKey = `${string}::${string}`;

export interface ProjectSeedRow {
  slug: string;
  title: string;
  summary: string;
  readme: string;
  techStack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  status: 'published';
  order: number;
}

export interface SkillSeedRow {
  name: string;
  category: string;
  proficiency: number;
  order: number;
}

export interface PortfolioSeedPlan {
  about: { action: 'insert' | 'skip'; content: string | null };
  projects: { insert: ProjectSeedRow[]; skippedSlugs: string[] };
  skills: { insert: SkillSeedRow[]; skippedKeys: SeedSkillKey[] };
}

export function skillSeedKey(category: string, name: string): SeedSkillKey {
  return `${category}::${name}`;
}

export function toProjectSeedRows(
  projects: readonly PortfolioProject[]
): ProjectSeedRow[] {
  return projects.map((project, index) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    readme: project.readme,
    techStack: [...project.techStack],
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    status: 'published',
    order: index,
  }));
}

export function toSkillSeedRows(
  skills: PortfolioContent['skills'],
  proficiency = DEFAULT_SEED_SKILL_PROFICIENCY
): SkillSeedRow[] {
  const rows: SkillSeedRow[] = [];
  let order = 0;

  for (const [category, names] of Object.entries(skills)) {
    for (const name of names) {
      rows.push({
        name,
        category,
        proficiency,
        order,
      });
      order += 1;
    }
  }

  return rows;
}

export function planPortfolioSeed(input: {
  content: PortfolioContent;
  existingAboutCount: number;
  existingProjectSlugs: readonly string[];
  existingSkillKeys: readonly string[];
}): PortfolioSeedPlan {
  const existingSlugs = new Set(input.existingProjectSlugs);
  const existingSkills = new Set(input.existingSkillKeys);
  const projectRows = toProjectSeedRows(input.content.projects);
  const skillRows = toSkillSeedRows(input.content.skills);

  const projectsToInsert: ProjectSeedRow[] = [];
  const skippedSlugs: string[] = [];
  for (const row of projectRows) {
    if (existingSlugs.has(row.slug)) {
      skippedSlugs.push(row.slug);
    } else {
      projectsToInsert.push(row);
    }
  }

  const skillsToInsert: SkillSeedRow[] = [];
  const skippedKeys: SeedSkillKey[] = [];
  for (const row of skillRows) {
    const key = skillSeedKey(row.category, row.name);
    if (existingSkills.has(key)) {
      skippedKeys.push(key);
    } else {
      skillsToInsert.push(row);
    }
  }

  return {
    about:
      input.existingAboutCount > 0
        ? { action: 'skip', content: null }
        : { action: 'insert', content: input.content.about },
    projects: {
      insert: projectsToInsert,
      skippedSlugs,
    },
    skills: {
      insert: skillsToInsert,
      skippedKeys,
    },
  };
}
