// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { PortfolioContent } from '@/types/portfolio';
import {
  PORTFOLIO_CACHE_KEY,
  isPortfolioContent,
  parsePortfolioCache,
  readPortfolioCache,
  serializePortfolioCache,
  writePortfolioCache,
} from './portfolio-cache';

const sample: PortfolioContent = {
  about: 'Hello',
  projects: [
    {
      slug: 'demo',
      title: 'Demo',
      summary: 'Summary',
      readme: '# Demo',
      techStack: ['TypeScript'],
      liveUrl: null,
      githubUrl: 'https://github.com/example/demo',
      images: [],
    },
  ],
  skills: { languages: ['TypeScript'] },
};

function memoryStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    store,
  };
}

describe('isPortfolioContent', () => {
  it('accepts a valid payload', () => {
    expect(isPortfolioContent(sample)).toBe(true);
  });

  it('rejects malformed payloads', () => {
    expect(isPortfolioContent(null)).toBe(false);
    expect(isPortfolioContent({ about: 1 })).toBe(false);
    expect(
      isPortfolioContent({
        about: 'x',
        projects: [null],
        skills: {},
      })
    ).toBe(false);
    expect(
      isPortfolioContent({
        ...sample,
        projects: [{ slug: 'x' }],
      })
    ).toBe(false);
    expect(
      isPortfolioContent({
        ...sample,
        projects: [
          {
            ...sample.projects[0],
            liveUrl: 12,
          },
        ],
      })
    ).toBe(false);
    expect(
      isPortfolioContent({
        ...sample,
        projects: [
          {
            ...sample.projects[0],
            githubUrl: 12,
          },
        ],
      })
    ).toBe(false);
    expect(
      isPortfolioContent({
        about: 'x',
        projects: 'nope',
        skills: {},
      })
    ).toBe(false);
    expect(
      isPortfolioContent({
        ...sample,
        skills: { languages: [1] },
      })
    ).toBe(false);
    expect(
      isPortfolioContent({
        about: 'x',
        projects: [],
        skills: null,
      })
    ).toBe(false);
  });

  it('accepts nullable URL fields when they are strings', () => {
    expect(
      isPortfolioContent({
        ...sample,
        projects: [
          {
            ...sample.projects[0],
            liveUrl: 'https://example.com',
            githubUrl: null,
          },
        ],
      })
    ).toBe(true);
  });

  it('accepts legacy cache projects that omit images', () => {
    const { images: _images, ...legacyProject } = sample.projects[0];
    expect(
      isPortfolioContent({
        ...sample,
        projects: [legacyProject as (typeof sample.projects)[0]],
      })
    ).toBe(true);
  });
});

describe('portfolio cache round-trip', () => {
  it('serializes and parses a valid record', () => {
    const raw = serializePortfolioCache(sample, '2026-07-12T00:00:00.000Z');
    expect(parsePortfolioCache(raw)).toEqual({
      version: 1,
      savedAt: '2026-07-12T00:00:00.000Z',
      content: sample,
    });
  });

  it('returns null for missing or invalid raw values', () => {
    expect(parsePortfolioCache(null)).toBeNull();
    expect(parsePortfolioCache('{')).toBeNull();
    expect(parsePortfolioCache('null')).toBeNull();
    expect(parsePortfolioCache('{"version":2}')).toBeNull();
    expect(
      parsePortfolioCache(
        JSON.stringify({
          version: 1,
          savedAt: 'now',
          content: { about: 'x', projects: [], skills: null },
        })
      )
    ).toBeNull();
  });

  it('reads and writes through a Storage-like object', () => {
    const storage = memoryStorage();
    writePortfolioCache(storage, sample, new Date('2026-07-12T12:00:00.000Z'));
    expect(storage.store[PORTFOLIO_CACHE_KEY]).toContain('"version":1');
    expect(readPortfolioCache(storage)?.content.about).toBe('Hello');
  });
});
