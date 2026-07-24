export const SKILL_CATEGORIES = [
  'languages',
  'frontend',
  'backend',
  'tools',
  'interests',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SKILL_PROFICIENCIES = [
  'beginner',
  'intermediate',
  'advanced',
] as const;

export type SkillProficiency = (typeof SKILL_PROFICIENCIES)[number];

export const LANGUAGE_SKILL_CATEGORY = 'languages' satisfies SkillCategory;

export const DEFAULT_LANGUAGE_SKILL_PROFICIENCY: SkillProficiency =
  'intermediate';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  languages: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Tools',
  interests: 'Interests',
};

export const SKILL_PROFICIENCY_LABELS: Record<SkillProficiency, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function isSkillCategory(value: string): value is SkillCategory {
  return (SKILL_CATEGORIES as readonly string[]).includes(value);
}

export function isSkillProficiency(value: string): value is SkillProficiency {
  return (SKILL_PROFICIENCIES as readonly string[]).includes(value);
}

export function isLanguageSkillCategory(category: string): boolean {
  return category === LANGUAGE_SKILL_CATEGORY;
}

export function skillProficiencyFromLegacyScore(
  score: number
): SkillProficiency {
  if (score <= 39) return 'beginner';
  if (score <= 69) return 'intermediate';
  return 'advanced';
}
