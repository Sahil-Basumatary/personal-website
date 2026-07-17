// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { PortfolioContent } from '@/types/portfolio';
import {
  DEFAULT_SEED_SKILL_PROFICIENCY,
  planPortfolioSeed,
  skillSeedKey,
  toProjectSeedRows,
  toSkillSeedRows,
} from './seed-plan';

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
  it('flattens categories with default proficiency and sequential order', () => {
    expect(toSkillSeedRows(sample.skills)).toEqual([
      {
        name: 'TypeScript',
        category: 'languages',
        proficiency: DEFAULT_SEED_SKILL_PROFICIENCY,
        order: 0,
      },
      {
        name: 'Python',
        category: 'languages',
        proficiency: DEFAULT_SEED_SKILL_PROFICIENCY,
        order: 1,
      },
      {
        name: 'Git',
        category: 'tools',
        proficiency: DEFAULT_SEED_SKILL_PROFICIENCY,
        order: 2,
      },
    ]);
  });

  it('allows a custom proficiency', () => {
    expect(toSkillSeedRows({ tools: ['Docker'] }, 55)[0]?.proficiency).toBe(55);
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
