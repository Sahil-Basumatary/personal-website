import type {
  PortfolioContent,
  PortfolioLanguageSkill,
  PortfolioProject,
  PortfolioSkills,
  PortfolioStoryImage,
} from '@/types/portfolio';
import {
  DEFAULT_LANGUAGE_SKILL_PROFICIENCY,
  isLanguageSkillCategory,
  isSkillProficiency,
  type SkillProficiency,
} from './skill-taxonomy';

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface ProjectRecord {
  slug: string;
  title: string;
  summary: string;
  readme: string;
  techStack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  status: ProjectStatus;
  order: number;
  images?: readonly PortfolioStoryImage[];
}

export interface SkillRecord {
  name: string;
  category: string;
  order: number;
  proficiency?: SkillProficiency | null;
}

export function mapStoryImages(
  images: readonly PortfolioStoryImage[] | undefined
): PortfolioStoryImage[] {
  if (!images?.length) return [];
  return images
    .slice()
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.url.localeCompare(b.url);
    })
    .map((image) => ({
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      order: image.order,
    }));
}

export function mapProjectRecord(row: ProjectRecord): PortfolioProject {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    readme: row.readme,
    techStack: [...row.techStack],
    liveUrl: row.liveUrl,
    githubUrl: row.githubUrl,
    images: mapStoryImages(row.images),
  };
}

export function mapPublishedProjects(
  rows: readonly ProjectRecord[]
): PortfolioProject[] {
  return rows
    .filter((row) => row.status === 'published')
    .slice()
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    })
    .map(mapProjectRecord);
}

function resolveLanguageProficiency(
  value: SkillProficiency | null | undefined
): SkillProficiency {
  return value && isSkillProficiency(value)
    ? value
    : DEFAULT_LANGUAGE_SKILL_PROFICIENCY;
}

export function mapSkillRecords(rows: readonly SkillRecord[]): PortfolioSkills {
  const byCategory = new Map<
    string,
    {
      minOrder: number;
      items: {
        name: string;
        order: number;
        proficiency: SkillProficiency | null;
      }[];
    }
  >();

  for (const row of rows) {
    const category = row.category.trim();
    const name = row.name.trim();
    if (!category || !name) continue;

    const proficiency = isLanguageSkillCategory(category)
      ? resolveLanguageProficiency(row.proficiency)
      : null;

    const existing = byCategory.get(category);
    if (!existing) {
      byCategory.set(category, {
        minOrder: row.order,
        items: [{ name, order: row.order, proficiency }],
      });
      continue;
    }

    existing.minOrder = Math.min(existing.minOrder, row.order);
    existing.items.push({ name, order: row.order, proficiency });
  }

  const orderedCategories = [...byCategory.entries()].sort((a, b) => {
    if (a[1].minOrder !== b[1].minOrder) {
      return a[1].minOrder - b[1].minOrder;
    }
    return a[0].localeCompare(b[0]);
  });

  const skills: PortfolioSkills = {};
  for (const [category, group] of orderedCategories) {
    const items = group.items.slice().sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

    if (isLanguageSkillCategory(category)) {
      skills[category] = items.map(
        (item): PortfolioLanguageSkill => ({
          name: item.name,
          proficiency: resolveLanguageProficiency(item.proficiency),
        })
      );
      continue;
    }

    skills[category] = items.map((item) => item.name);
  }
  return skills;
}

export function mapPortfolioContent(input: {
  about: string | null | undefined;
  projects: readonly ProjectRecord[];
  skills: readonly SkillRecord[];
}): PortfolioContent {
  return {
    about: input.about ?? '',
    projects: mapPublishedProjects(input.projects),
    skills: mapSkillRecords(input.skills),
  };
}
