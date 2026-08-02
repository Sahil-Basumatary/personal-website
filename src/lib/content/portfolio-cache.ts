import type {
  PortfolioContent,
  PortfolioLanguageSkill,
  PortfolioProject,
  PortfolioSkillItem,
  PortfolioStoryImage,
} from '@/types/portfolio';
import { isLanguageSkillCategory, isSkillProficiency } from './skill-taxonomy';

export const PORTFOLIO_CACHE_KEY = 'sahilbzy:portfolio:v2';
export const PORTFOLIO_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface PortfolioCacheRecord {
  version: 1;
  savedAt: string;
  content: PortfolioContent;
}

export function isPortfolioCacheFresh(
  savedAt: string,
  now: Date = new Date(),
  maxAgeMs: number = PORTFOLIO_CACHE_MAX_AGE_MS
): boolean {
  const savedAtMs = Date.parse(savedAt);
  if (Number.isNaN(savedAtMs)) {
    return false;
  }
  return now.getTime() - savedAtMs <= maxAgeMs;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isLanguageSkillItem(value: unknown): value is PortfolioLanguageSkill {
  if (!value || typeof value !== 'object') return false;
  const item = value as PortfolioLanguageSkill;
  return typeof item.name === 'string' && isSkillProficiency(item.proficiency);
}

function isSkillItemList(
  category: string,
  value: unknown
): value is PortfolioSkillItem[] {
  if (!Array.isArray(value)) return false;
  if (isLanguageSkillCategory(category)) {
    return value.every(isLanguageSkillItem);
  }
  return value.every((item) => typeof item === 'string');
}

function isPortfolioStoryImage(value: unknown): value is PortfolioStoryImage {
  if (!value || typeof value !== 'object') return false;
  const image = value as PortfolioStoryImage;
  return (
    typeof image.url === 'string' &&
    typeof image.alt === 'string' &&
    (image.caption === null || typeof image.caption === 'string') &&
    typeof image.order === 'number' &&
    Number.isFinite(image.order)
  );
}

function readProjectImages(project: {
  images?: unknown;
}): PortfolioStoryImage[] | null {
  if (project.images === undefined) return [];
  if (!Array.isArray(project.images)) return null;
  if (!project.images.every(isPortfolioStoryImage)) return null;
  return project.images.map((image) => ({
    url: image.url,
    alt: image.alt,
    caption: image.caption,
    order: image.order,
  }));
}

function isPortfolioProject(value: unknown): value is PortfolioProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as PortfolioProject & { images?: unknown };
  const images = readProjectImages(project);
  if (images === null) return false;
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

function normalizePortfolioContent(
  content: PortfolioContent
): PortfolioContent {
  return {
    about: content.about,
    projects: content.projects.map((project) => ({
      ...project,
      images: Array.isArray(project.images) ? project.images : [],
    })),
    skills: content.skills,
  };
}

export function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== 'object') return false;
  const content = value as PortfolioContent;
  if (typeof content.about !== 'string' || !Array.isArray(content.projects)) {
    return false;
  }
  if (!content.projects.every(isPortfolioProject)) return false;
  if (!content.skills || typeof content.skills !== 'object') return false;
  return Object.entries(content.skills).every(([category, items]) =>
    isSkillItemList(category, items)
  );
}

export function parsePortfolioCache(
  raw: string | null,
  now: Date = new Date()
): PortfolioCacheRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as PortfolioCacheRecord;
    if (record.version !== 1 || typeof record.savedAt !== 'string') {
      return null;
    }
    if (!isPortfolioCacheFresh(record.savedAt, now)) {
      return null;
    }
    if (!isPortfolioContent(record.content)) return null;
    return {
      version: 1,
      savedAt: record.savedAt,
      content: normalizePortfolioContent(record.content),
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
    content: normalizePortfolioContent(content),
  };
  return JSON.stringify(record);
}

export function readPortfolioCache(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  now: Date = new Date()
): PortfolioCacheRecord | null {
  const raw = storage.getItem(PORTFOLIO_CACHE_KEY);
  const record = parsePortfolioCache(raw, now);
  if (!record && raw) {
    storage.removeItem(PORTFOLIO_CACHE_KEY);
  }
  return record;
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
