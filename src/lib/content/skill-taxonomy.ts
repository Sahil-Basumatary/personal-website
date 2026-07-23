export const SKILL_CATEGORIES = [
  'languages',
  'frontend',
  'backend',
  'tools',
  'interests',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const LANGUAGE_SKILL_CATEGORY = 'languages' satisfies SkillCategory;

export const DEFAULT_LANGUAGE_SKILL_LEVEL: SkillLevel = 'intermediate';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  languages: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Tools',
  interests: 'Interests',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function isSkillCategory(value: string): value is SkillCategory {
  return (SKILL_CATEGORIES as readonly string[]).includes(value);
}

export function isSkillLevel(value: string): value is SkillLevel {
  return (SKILL_LEVELS as readonly string[]).includes(value);
}

export function isLanguageSkillCategory(category: string): boolean {
  return category === LANGUAGE_SKILL_CATEGORY;
}

export function skillLevelFromProficiency(score: number): SkillLevel {
  if (score <= 39) return 'beginner';
  if (score <= 69) return 'intermediate';
  return 'advanced';
}
