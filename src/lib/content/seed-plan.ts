import type {
  PortfolioContent,
  PortfolioProject,
  PortfolioSkillItem,
} from '@/types/portfolio';
import {
  DEFAULT_LANGUAGE_SKILL_PROFICIENCY,
  isLanguageSkillCategory,
  isSkillProficiency,
  type SkillProficiency,
} from './skill-taxonomy';

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
  proficiency: SkillProficiency | null;
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

function seedEntryName(entry: PortfolioSkillItem): string {
  return typeof entry === 'string' ? entry : entry.name;
}

function seedEntryProficiency(
  category: string,
  entry: PortfolioSkillItem,
  fallback: SkillProficiency
): SkillProficiency | null {
  if (!isLanguageSkillCategory(category)) return null;
  if (typeof entry === 'string') return fallback;
  return isSkillProficiency(entry.proficiency) ? entry.proficiency : fallback;
}

export function toSkillSeedRows(
  skills: PortfolioContent['skills'],
  languageProficiency: SkillProficiency = DEFAULT_LANGUAGE_SKILL_PROFICIENCY
): SkillSeedRow[] {
  const rows: SkillSeedRow[] = [];
  let order = 0;

  for (const [category, entries] of Object.entries(skills)) {
    for (const entry of entries) {
      rows.push({
        name: seedEntryName(entry),
        category,
        proficiency: seedEntryProficiency(category, entry, languageProficiency),
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
