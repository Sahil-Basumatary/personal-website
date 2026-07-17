// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import type { PortfolioContent } from '@/types/portfolio';
import {
  loadPortfolioWithDeps,
  resolvePortfolioLoad,
} from './portfolio-loader';
import type { ProjectRecord, SkillRecord } from './map-portfolio';

const fallback: PortfolioContent = {
  about: 'Fallback about',
  projects: [
    {
      slug: 'fallback',
      title: 'Fallback',
      summary: 'Bundled',
      readme: '# Fallback',
      techStack: ['TypeScript'],
      liveUrl: null,
      githubUrl: null,
      images: [],
    },
  ],
  skills: { languages: ['TypeScript'] },
};

const published: ProjectRecord = {
  slug: 'live',
  title: 'Live',
  summary: 'From DB',
  readme: '# Live',
  techStack: ['React'],
  liveUrl: 'https://example.com',
  githubUrl: null,
  status: 'published',
  order: 0,
  images: [],
};

const draft: ProjectRecord = {
  ...published,
  slug: 'draft',
  title: 'Draft',
  status: 'draft',
  order: 1,
};

const skill: SkillRecord = {
  name: 'React',
  category: 'frontend',
  order: 0,
};

describe('resolvePortfolioLoad', () => {
  it('maps a successful database snapshot, including empty content', () => {
    expect(
      resolvePortfolioLoad({
        ok: true,
        about: null,
        projects: [],
        skills: [],
        fallback,
      })
    ).toEqual({
      content: { about: '', projects: [], skills: {} },
      source: 'database',
    });
  });

  it('keeps only published projects from a successful snapshot', () => {
    const result = resolvePortfolioLoad({
      ok: true,
      about: 'Hello',
      projects: [draft, published],
      skills: [skill],
      fallback,
    });

    expect(result.source).toBe('database');
    expect(result.content.about).toBe('Hello');
    expect(result.content.projects.map((project) => project.slug)).toEqual([
      'live',
    ]);
    expect(result.content.skills).toEqual({ frontend: ['React'] });
  });

  it('returns the bundled fallback on failure', () => {
    expect(
      resolvePortfolioLoad({
        ok: false,
        fallback,
      })
    ).toEqual({
      content: fallback,
      source: 'fallback',
    });
  });
});

describe('loadPortfolioWithDeps', () => {
  it('loads from the database when the snapshot succeeds', async () => {
    const reportError = vi.fn();
    const result = await loadPortfolioWithDeps({
      fetchSnapshot: async () => ({
        about: 'DB about',
        projects: [published],
        skills: [skill],
      }),
      reportError,
      fallback,
    });

    expect(reportError).not.toHaveBeenCalled();
    expect(result.source).toBe('database');
    expect(result.content.about).toBe('DB about');
    expect(result.content.projects).toHaveLength(1);
  });

  it('reports the error and uses fallback when the snapshot throws', async () => {
    const reportError = vi.fn();
    const failure = new Error('db down');
    const result = await loadPortfolioWithDeps({
      fetchSnapshot: async () => {
        throw failure;
      },
      reportError,
      fallback,
    });

    expect(reportError).toHaveBeenCalledWith(failure);
    expect(result).toEqual({
      content: fallback,
      source: 'fallback',
    });
  });
});
