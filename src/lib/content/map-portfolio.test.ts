// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  mapPortfolioContent,
  mapProjectRecord,
  mapPublishedProjects,
  mapSkillRecords,
  type ProjectRecord,
  type SkillRecord,
} from './map-portfolio';

const baseProject = (
  overrides: Partial<ProjectRecord> & Pick<ProjectRecord, 'slug' | 'title'>
): ProjectRecord => ({
  summary: 'A summary',
  readme: '# Readme',
  techStack: ['TypeScript'],
  liveUrl: null,
  githubUrl: null,
  status: 'published',
  order: 0,
  ...overrides,
});

describe('mapProjectRecord', () => {
  it('copies public fields and clones techStack', () => {
    const techStack = ['React', 'Neon'];
    const mapped = mapProjectRecord(
      baseProject({
        slug: 'demo',
        title: 'Demo',
        techStack,
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/example/demo',
      })
    );
    expect(mapped).toEqual({
      slug: 'demo',
      title: 'Demo',
      summary: 'A summary',
      readme: '# Readme',
      techStack: ['React', 'Neon'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example/demo',
      images: [],
    });
    expect(mapped.techStack).not.toBe(techStack);
  });

  it('orders and clones story images', () => {
    const images = [
      {
        url: 'https://media.example/b.jpg',
        alt: 'B',
        caption: null,
        order: 2,
      },
      {
        url: 'https://media.example/a.jpg',
        alt: 'A',
        caption: 'First',
        order: 1,
      },
    ];
    const mapped = mapProjectRecord(
      baseProject({ slug: 'demo', title: 'Demo', images })
    );
    expect(mapped.images).toEqual([
      {
        url: 'https://media.example/a.jpg',
        alt: 'A',
        caption: 'First',
        order: 1,
      },
      {
        url: 'https://media.example/b.jpg',
        alt: 'B',
        caption: null,
        order: 2,
      },
    ]);
    expect(mapped.images).not.toBe(images);
  });

  it('breaks image order ties by url', () => {
    const mapped = mapProjectRecord(
      baseProject({
        slug: 'demo',
        title: 'Demo',
        images: [
          {
            url: 'https://media.example/z.jpg',
            alt: 'Z',
            caption: null,
            order: 1,
          },
          {
            url: 'https://media.example/a.jpg',
            alt: 'A',
            caption: null,
            order: 1,
          },
        ],
      })
    );
    expect(mapped.images.map((image) => image.url)).toEqual([
      'https://media.example/a.jpg',
      'https://media.example/z.jpg',
    ]);
  });
});

describe('mapPublishedProjects', () => {
  it('keeps only published rows and sorts by order then title', () => {
    const rows: ProjectRecord[] = [
      baseProject({ slug: 'c', title: 'Charlie', order: 1, status: 'draft' }),
      baseProject({ slug: 'b', title: 'Bravo', order: 1, status: 'published' }),
      baseProject({
        slug: 'a',
        title: 'Alpha',
        order: 1,
        status: 'published',
      }),
      baseProject({
        slug: 'z',
        title: 'Zulu',
        order: 0,
        status: 'published',
      }),
      baseProject({
        slug: 'x',
        title: 'X-Ray',
        order: 2,
        status: 'archived',
      }),
    ];
    expect(mapPublishedProjects(rows).map((p) => p.slug)).toEqual([
      'z',
      'a',
      'b',
    ]);
  });

  it('returns an empty list when nothing is published', () => {
    expect(
      mapPublishedProjects([
        baseProject({ slug: 'd', title: 'Draft', status: 'draft' }),
      ])
    ).toEqual([]);
  });
});

describe('mapSkillRecords', () => {
  it('groups names by category and sorts stably', () => {
    const rows: SkillRecord[] = [
      { name: 'React', category: 'frontend', order: 1 },
      { name: 'TypeScript', category: 'languages', order: 0 },
      { name: 'Python', category: 'languages', order: 1 },
      { name: 'Next.js', category: 'frontend', order: 0 },
      { name: '  ', category: 'languages', order: 9 },
      { name: 'Ghost', category: '  ', order: 9 },
    ];
    expect(mapSkillRecords(rows)).toEqual({
      languages: ['TypeScript', 'Python'],
      frontend: ['Next.js', 'React'],
    });
  });

  it('orders categories by the earliest skill order', () => {
    expect(
      Object.keys(
        mapSkillRecords([
          { name: 'SQL', category: 'languages', order: 5 },
          { name: 'React', category: 'frontend', order: 1 },
        ])
      )
    ).toEqual(['frontend', 'languages']);
  });

  it('breaks category ties alphabetically', () => {
    expect(
      mapSkillRecords([
        { name: 'Docker', category: 'tools', order: 0 },
        { name: 'SQL', category: 'languages', order: 0 },
      ])
    ).toEqual({
      languages: ['SQL'],
      tools: ['Docker'],
    });
  });

  it('breaks name ties alphabetically inside a category', () => {
    expect(
      mapSkillRecords([
        { name: 'Zig', category: 'languages', order: 1 },
        { name: 'Ada', category: 'languages', order: 1 },
      ])
    ).toEqual({
      languages: ['Ada', 'Zig'],
    });
  });
});

describe('mapPortfolioContent', () => {
  it('normalizes missing about to an empty string', () => {
    expect(
      mapPortfolioContent({
        about: undefined,
        projects: [],
        skills: [],
      })
    ).toEqual({ about: '', projects: [], skills: {} });
  });

  it('maps about, published projects and skills together', () => {
    const content = mapPortfolioContent({
      about: 'Hello',
      projects: [
        baseProject({ slug: 'keep', title: 'Keep', status: 'published' }),
        baseProject({ slug: 'skip', title: 'Skip', status: 'draft' }),
      ],
      skills: [{ name: 'Go', category: 'languages', order: 0 }],
    });
    expect(content.about).toBe('Hello');
    expect(content.projects).toHaveLength(1);
    expect(content.projects[0]?.slug).toBe('keep');
    expect(content.skills).toEqual({ languages: ['Go'] });
  });
});
