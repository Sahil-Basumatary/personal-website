// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SYSTEM_DRIVE } from './tree';
import { PROJECTS } from './projects';
import type { FolderNode } from '@/types/file-system';

function folder(node: FolderNode, name: string): FolderNode {
  const child = node.children[name];
  if (!child || child.kind !== 'folder') {
    throw new Error(`expected folder "${name}"`);
  }
  return child;
}

describe('SYSTEM_DRIVE', () => {
  it('exposes the expected top-level layout', () => {
    expect(SYSTEM_DRIVE.kind).toBe('folder');
    expect(Object.keys(SYSTEM_DRIVE.children)).toEqual(
      expect.arrayContaining(['Desktop', 'Documents', 'Applications', 'Trash'])
    );
  });

  it('builds one project folder per project entry', () => {
    const projects = folder(folder(SYSTEM_DRIVE, 'Desktop'), 'Projects');
    expect(Object.keys(projects.children)).toHaveLength(PROJECTS.length);
  });

  it('includes README and tech-stack files inside a project', () => {
    const projects = folder(folder(SYSTEM_DRIVE, 'Desktop'), 'Projects');
    const first = folder(projects, PROJECTS[0].slug);
    expect(first.children['README.md']?.kind).toBe('file');
    expect(first.children['tech-stack.json']?.kind).toBe('file');
  });

  it('only adds a Live Site alias when a project has a live url', () => {
    const projects = folder(folder(SYSTEM_DRIVE, 'Desktop'), 'Projects');
    for (const meta of PROJECTS) {
      const node = folder(projects, meta.slug);
      const hasAlias = node.children['Live Site']?.kind === 'alias';
      expect(hasAlias).toBe(Boolean(meta.techStack.liveUrl));
    }
  });
});
