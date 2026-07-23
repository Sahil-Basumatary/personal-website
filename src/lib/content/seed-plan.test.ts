// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { PortfolioContent } from '@/types/portfolio';
import {
  planPortfolioSeed,
  skillSeedKey,
  toProjectSeedRows,
  toSkillSeedRows,
} from './seed-plan';
import { DEFAULT_LANGUAGE_SKILL_LEVEL } from './skill-taxonomy';

const sample: PortfolioContent = {
  about: 'About me',
  projects: [
    {
      slug: 'alpha',
      title: 'Alpha',
      summary: 'First',
      readme: '# Alpha',
      techStack: ['TypeScript'],
      liveUrl: 'https://example.com',
      githubUrl: null,
      images: [],
    },
    {
      slug: 'beta',
      title: 'Beta',
      summary: 'Second',
      readme: '# Beta',
      techStack: ['Python'],
      liveUrl: null,
      githubUrl: 'https://github.com/example/beta',
      images: [],
    },
  ],
  skills: {
    languages: ['TypeScript', 'Python'],
    tools: ['Git'],
  },
};

describe('skillSeedKey', () => {
  it('joins category and name', () => {
    expect(skillSeedKey('languages', 'TypeScript')).toBe(
      'languages::TypeScript'
    );
  });
});

describe('toProjectSeedRows', () => {
  it('marks bundled projects published and preserves order', () => {
    expect(toProjectSeedRows(sample.projects)).toEqual([
      {
        slug: 'alpha',
        title: 'Alpha',
        summary: 'First',
        readme: '# Alpha',
        techStack: ['TypeScript'],
        liveUrl: 'https://example.com',
        githubUrl: null,
        status: 'published',
        order: 0,
      },
      {
        slug: 'beta',
        title: 'Beta',
        summary: 'Second',
        readme: '# Beta',
        techStack: ['Python'],
        liveUrl: null,
        githubUrl: 'https://github.com/example/beta',
        status: 'published',
        order: 1,
      },
    ]);
  });
});

describe('toSkillSeedRows', () => {
  it('flattens categories with language levels and sequential order', () => {
    expect(toSkillSeedRows(sample.skills)).toEqual([
      {
        name: 'TypeScript',
        category: 'languages',
        level: DEFAULT_LANGUAGE_SKILL_LEVEL,
        order: 0,
      },
      {
        name: 'Python',
        category: 'languages',
        level: DEFAULT_LANGUAGE_SKILL_LEVEL,
        order: 1,
      },
      {
        name: 'Git',
        category: 'tools',
        level: null,
        order: 2,
      },
    ]);
  });

  it('allows a custom language level', () => {
    expect(toSkillSeedRows({ languages: ['Go'] }, 'advanced')[0]?.level).toBe(
      'advanced'
    );
    expect(toSkillSeedRows({ tools: ['Docker'] }, 'advanced')[0]?.level).toBe(
      null
    );
  });
});

describe('planPortfolioSeed', () => {
  it('inserts everything into an empty database', () => {
    const plan = planPortfolioSeed({
      content: sample,
      existingAboutCount: 0,
      existingProjectSlugs: [],
      existingSkillKeys: [],
    });

    expect(plan.about).toEqual({ action: 'insert', content: 'About me' });
    expect(plan.projects.insert.map((row) => row.slug)).toEqual([
      'alpha',
      'beta',
    ]);
    expect(plan.projects.skippedSlugs).toEqual([]);
    expect(plan.skills.insert).toHaveLength(3);
    expect(plan.skills.skippedKeys).toEqual([]);
  });

  it('skips existing about, project slugs and skill keys', () => {
    const plan = planPortfolioSeed({
      content: sample,
      existingAboutCount: 1,
      existingProjectSlugs: ['alpha'],
      existingSkillKeys: [skillSeedKey('languages', 'TypeScript')],
    });

    expect(plan.about).toEqual({ action: 'skip', content: null });
    expect(plan.projects.insert.map((row) => row.slug)).toEqual(['beta']);
    expect(plan.projects.skippedSlugs).toEqual(['alpha']);
    expect(plan.skills.insert.map((row) => row.name)).toEqual([
      'Python',
      'Git',
    ]);
    expect(plan.skills.skippedKeys).toEqual(['languages::TypeScript']);
  });
});
