// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { PortfolioContent } from '@/types/portfolio';
import {
  PORTFOLIO_CACHE_KEY,
  PORTFOLIO_CACHE_MAX_AGE_MS,
  isPortfolioCacheFresh,
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
  skills: {
    languages: [{ name: 'TypeScript', proficiency: 'advanced' }],
  },
};

function memoryStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    store,
  };
}

const FRESH_SAVED_AT = '2026-08-01T12:00:00.000Z';
const FRESH_NOW = new Date('2026-08-02T12:00:00.000Z');

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
        skills: { languages: [{ name: 'TypeScript' }] },
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

  it('accepts projects with valid story images', () => {
    expect(
      isPortfolioContent({
        ...sample,
        projects: [
          {
            ...sample.projects[0],
            images: [
              {
                url: 'https://media.example/a.jpg',
                alt: 'A',
                caption: 'Cap',
                order: 0,
              },
              {
                url: 'https://media.example/b.jpg',
                alt: 'B',
                caption: null,
                order: 1,
              },
            ],
          },
        ],
      })
    ).toBe(true);
  });

  it('rejects nullish image entries', () => {
    expect(
      isPortfolioContent({
        ...sample,
        projects: [
          {
            ...sample.projects[0],
            images: [null],
          },
        ],
      })
    ).toBe(false);
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

  it('rejects projects with malformed images', () => {
    expect(
      isPortfolioContent({
        ...sample,
        projects: [
          {
            ...sample.projects[0],
            images: 'nope',
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
            images: [{ url: 1, alt: 'x', caption: null, order: 0 }],
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
            images: [
              {
                url: 'https://media.example/a.jpg',
                alt: 'A',
                caption: 12,
                order: 0,
              },
            ],
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
            images: [
              {
                url: 'https://media.example/a.jpg',
                alt: 'A',
                caption: null,
                order: Number.NaN,
              },
            ],
          },
        ],
      })
    ).toBe(false);
  });
});

describe('portfolio cache round-trip', () => {
  it('serializes and parses a valid record', () => {
    const raw = serializePortfolioCache(sample, FRESH_SAVED_AT);
    expect(parsePortfolioCache(raw, FRESH_NOW)).toEqual({
      version: 1,
      savedAt: FRESH_SAVED_AT,
      content: sample,
    });
  });

  it('normalizes missing project images to an empty array', () => {
    const { images: _images, ...legacyProject } = sample.projects[0];
    const legacy = {
      ...sample,
      projects: [legacyProject as (typeof sample.projects)[0]],
    };
    const parsed = parsePortfolioCache(
      serializePortfolioCache(legacy, FRESH_SAVED_AT),
      FRESH_NOW
    );
    expect(parsed?.content.projects[0]?.images).toEqual([]);
  });

  it('normalizes non-array project images to an empty array on write', () => {
    const raw = serializePortfolioCache(
      {
        ...sample,
        projects: [
          {
            ...sample.projects[0],
            images:
              null as unknown as PortfolioContent['projects'][number]['images'],
          },
        ],
      },
      FRESH_SAVED_AT
    );
    expect(JSON.parse(raw).content.projects[0].images).toEqual([]);
  });

  it('returns null for missing or invalid raw values', () => {
    expect(parsePortfolioCache(null)).toBeNull();
    expect(parsePortfolioCache('{')).toBeNull();
    expect(parsePortfolioCache('null')).toBeNull();
    expect(parsePortfolioCache('"string"')).toBeNull();
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
    writePortfolioCache(storage, sample, new Date(FRESH_SAVED_AT));
    expect(storage.store[PORTFOLIO_CACHE_KEY]).toContain('"version":1');
    expect(readPortfolioCache(storage, FRESH_NOW)?.content.about).toBe('Hello');
  });

  it('expires stale local portfolio snapshots', () => {
    const savedAt = '2026-01-01T00:00:00.000Z';
    const now = new Date('2026-01-10T00:00:00.000Z');
    expect(
      isPortfolioCacheFresh(savedAt, now, PORTFOLIO_CACHE_MAX_AGE_MS)
    ).toBe(false);
    expect(
      parsePortfolioCache(serializePortfolioCache(sample, savedAt), now)
    ).toBeNull();

    const storage = memoryStorage();
    writePortfolioCache(storage, sample, new Date(savedAt));
    expect(readPortfolioCache(storage, now)).toBeNull();
    expect(storage.store[PORTFOLIO_CACHE_KEY]).toBeUndefined();
  });
});
