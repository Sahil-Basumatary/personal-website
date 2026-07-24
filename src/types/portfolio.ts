import type { SkillProficiency } from '@/lib/content/skill-taxonomy';

export interface PortfolioStoryImage {
  url: string;
  alt: string;
  caption: string | null;
  order: number;
}

export interface PortfolioProject {
  slug: string;
  title: string;
  summary: string;
  readme: string;
  techStack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  images: PortfolioStoryImage[];
}

export interface PortfolioLanguageSkill {
  name: string;
  proficiency: SkillProficiency;
}

export type PortfolioSkillItem = string | PortfolioLanguageSkill;

export type PortfolioSkills = Record<string, PortfolioSkillItem[]>;

export interface PortfolioContent {
  about: string;
  projects: PortfolioProject[];
  skills: PortfolioSkills;
}

export type PortfolioProjectMeta = Omit<
  PortfolioProject,
  'slug' | 'readme' | 'images'
>;
