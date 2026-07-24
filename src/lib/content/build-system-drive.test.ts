// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { BUNDLED_PORTFOLIO } from './bundled-portfolio';
import {
  PROJECT_STORY_FILENAME,
  buildSystemDrive,
  toProjectMetaFile,
} from './build-system-drive';
import type { FolderNode } from '@/types/file-system';
import type { PortfolioContent, PortfolioProject } from '@/types/portfolio';

function folder(node: FolderNode, name: string): FolderNode {
  const child = node.children[name];
  if (!child || child.kind !== 'folder') {
    throw new Error(`expected folder "${name}"`);
  }
  return child;
}

const emptyContent: PortfolioContent = {
  about: '',
  projects: [],
  skills: {},
};

const sampleProject: PortfolioProject = {
  slug: 'demo',
  title: 'Demo',
  summary: 'Short summary',
  readme: '# Demo',
  techStack: ['TypeScript', 'Next.js'],
  liveUrl: 'https://example.com',
  githubUrl: 'https://github.com/example/demo',
  images: [
    {
      url: 'https://media.example/demo.jpg',
      alt: 'Demo shot',
      caption: null,
      order: 0,
    },
  ],
};

describe('toProjectMetaFile', () => {
  it('omits slug, readme and images from the on-disk meta file', () => {
    expect(toProjectMetaFile(sampleProject)).toEqual({
      title: 'Demo',
      summary: 'Short summary',
      techStack: ['TypeScript', 'Next.js'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example/demo',
    });
  });
});

describe('buildSystemDrive', () => {
  it('exposes the hard-coded Macintosh HD shell', () => {
    const drive = buildSystemDrive(emptyContent);
    expect(drive.name).toBe('Macintosh HD');
    expect(Object.keys(drive.children)).toEqual(
      expect.arrayContaining([
        'Desktop',
        'Documents',
        'Applications',
        'Trash',
        'README.md',
      ])
    );
    const desktop = folder(drive, 'Desktop');
    expect(desktop.children['Contact']?.kind).toBe('file');
    expect(desktop.children['Games']?.kind).toBe('folder');
    expect(folder(drive, 'Trash').children).toEqual({});
  });

  it('writes about, skills and project folders from content', () => {
    const drive = buildSystemDrive({
      about: 'About text',
      projects: [sampleProject],
      skills: {
        languages: [{ name: 'TypeScript', proficiency: 'advanced' }],
      },
    });
    const desktop = folder(drive, 'Desktop');
    expect(desktop.children['About Me']).toEqual({
      name: 'About Me',
      kind: 'file',
      content: 'About text',
    });
    expect(desktop.children['Skills.json']).toEqual({
      name: 'Skills.json',
      kind: 'file',
      content: JSON.stringify(
        {
          languages: [{ name: 'TypeScript', proficiency: 'advanced' }],
        },
        null,
        2
      ),
    });
    const project = folder(folder(desktop, 'Projects'), 'demo');
    expect(project.children[PROJECT_STORY_FILENAME]?.kind).toBe('file');
    expect(project.children['tech-stack.json']).toEqual({
      name: 'tech-stack.json',
      kind: 'file',
      content: JSON.stringify(toProjectMetaFile(sampleProject), null, 2),
    });
    expect(project.children['Live Site']).toEqual({
      name: 'Live Site',
      kind: 'alias',
      target: 'https://example.com',
    });
    expect(project.children['GitHub']).toEqual({
      name: 'GitHub',
      kind: 'alias',
      target: 'https://github.com/example/demo',
    });
  });

  it('omits link aliases when urls are missing', () => {
    const drive = buildSystemDrive({
      about: '',
      projects: [{ ...sampleProject, liveUrl: null, githubUrl: null }],
      skills: {},
    });
    const project = folder(
      folder(folder(drive, 'Desktop'), 'Projects'),
      'demo'
    );
    expect(project.children['Live Site']).toBeUndefined();
    expect(project.children['GitHub']).toBeUndefined();
  });

  it('builds the bundled fallback without losing projects', () => {
    const drive = buildSystemDrive(BUNDLED_PORTFOLIO);
    const projects = folder(folder(drive, 'Desktop'), 'Projects');
    expect(Object.keys(projects.children)).toHaveLength(
      BUNDLED_PORTFOLIO.projects.length
    );
    for (const project of BUNDLED_PORTFOLIO.projects) {
      const node = folder(projects, project.slug);
      expect(Boolean(node.children['Live Site'])).toBe(
        Boolean(project.liveUrl)
      );
      expect(Boolean(node.children['GitHub'])).toBe(Boolean(project.githubUrl));
    }
  });
});
