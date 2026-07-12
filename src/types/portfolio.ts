export interface PortfolioProject {
  slug: string;
  title: string;
  summary: string;
  readme: string;
  techStack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
}

export type PortfolioSkills = Record<string, string[]>;

export interface PortfolioContent {
  about: string;
  projects: PortfolioProject[];
  skills: PortfolioSkills;
}

export type PortfolioProjectMeta = Omit<PortfolioProject, 'slug' | 'readme'>;
