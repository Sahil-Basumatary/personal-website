import type { PortfolioContent, PortfolioProject } from '@/types/portfolio';

export const PORTFOLIO_CACHE_KEY = 'sahilbzy:portfolio:v1';

export interface PortfolioCacheRecord {
  version: 1;
  savedAt: string;
  content: PortfolioContent;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isPortfolioProject(value: unknown): value is PortfolioProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as PortfolioProject;
  return (
    typeof project.slug === 'string' &&
    typeof project.title === 'string' &&
    typeof project.summary === 'string' &&
    typeof project.readme === 'string' &&
    isStringArray(project.techStack) &&
    (project.liveUrl === null || typeof project.liveUrl === 'string') &&
    (project.githubUrl === null || typeof project.githubUrl === 'string')
  );
}

export function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== 'object') return false;
  const content = value as PortfolioContent;
  if (typeof content.about !== 'string' || !Array.isArray(content.projects)) {
    return false;
  }
  if (!content.projects.every(isPortfolioProject)) return false;
  if (!content.skills || typeof content.skills !== 'object') return false;
  return Object.values(content.skills).every(isStringArray);
}

export function parsePortfolioCache(
  raw: string | null
): PortfolioCacheRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as PortfolioCacheRecord;
    if (record.version !== 1 || typeof record.savedAt !== 'string') {
      return null;
    }
    if (!isPortfolioContent(record.content)) return null;
    return {
      version: 1,
      savedAt: record.savedAt,
      content: record.content,
    };
  } catch {
    return null;
  }
}

export function serializePortfolioCache(
  content: PortfolioContent,
  savedAt: string
): string {
  const record: PortfolioCacheRecord = {
    version: 1,
    savedAt,
    content,
  };
  return JSON.stringify(record);
}

export function readPortfolioCache(
  storage: Pick<Storage, 'getItem'>
): PortfolioCacheRecord | null {
  return parsePortfolioCache(storage.getItem(PORTFOLIO_CACHE_KEY));
}

export function writePortfolioCache(
  storage: Pick<Storage, 'setItem'>,
  content: PortfolioContent,
  now = new Date()
): void {
  storage.setItem(
    PORTFOLIO_CACHE_KEY,
    serializePortfolioCache(content, now.toISOString())
  );
}
