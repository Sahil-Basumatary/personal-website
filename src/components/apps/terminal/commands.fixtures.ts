import { vi } from 'vitest';
import type { CommandContext } from './commands';
import type { FSNode } from '@/types/file-system';

export function resolvePath(cwd: string, relative: string): string {
  const segments = relative.startsWith('/')
    ? []
    : cwd.split('/').filter(Boolean);
  for (const part of relative.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') segments.pop();
    else segments.push(part);
  }
  return '/' + segments.join('/');
}

export const FILES: Record<string, string> = {
  '/Desktop/Contact': 'email: sahil@example.com\ngithub: Sahil-Basumatary',
  '/Desktop/Skills.json': JSON.stringify({
    languages: ['TypeScript', 'Python'],
    frameworks: ['React', 'FastAPI'],
  }),
  '/Desktop/Projects/pioni/tech-stack.json': JSON.stringify({
    title: 'Pioni',
    summary: 'Live trading intelligence — reads sentiment before markets move.',
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Render'],
    liveUrl: 'https://www.pioni.ai',
    githubUrl: null,
  }),
  '/Desktop/Projects/broken/tech-stack.json': '{ not json',
  '/Desktop/notes.txt': 'line one\nline two',
};

export const NODES: Record<string, FSNode> = {
  '/': { name: '/', kind: 'folder', children: {} },
  '/Applications': { name: 'Applications', kind: 'folder', children: {} },
  '/Applications/Terminal': {
    name: 'Terminal',
    kind: 'app',
    component: 'terminal',
  },
  '/Desktop': { name: 'Desktop', kind: 'folder', children: {} },
  '/Desktop/Projects': { name: 'Projects', kind: 'folder', children: {} },
  '/Desktop/Projects/pioni': { name: 'pioni', kind: 'folder', children: {} },
  '/Desktop/empty': { name: 'empty', kind: 'folder', children: {} },
  '/Desktop/Contact': { name: 'Contact', kind: 'file', content: '' },
  '/Desktop/Skills.json': { name: 'Skills.json', kind: 'file', content: '' },
  '/Desktop/notes.txt': { name: 'notes.txt', kind: 'file', content: '' },
};

export const DIRS: Record<string, FSNode[]> = {
  '/': [NODES['/Applications'], NODES['/Desktop']],
  '/Applications': [NODES['/Applications/Terminal']],
  '/Desktop': [
    NODES['/Desktop/Projects'],
    NODES['/Desktop/Contact'],
    NODES['/Desktop/Skills.json'],
    NODES['/Desktop/notes.txt'],
  ],
  '/Desktop/Projects': [NODES['/Desktop/Projects/pioni']],
  '/Desktop/empty': [],
};

export function buildCtx(
  overrides: Partial<CommandContext> = {}
): CommandContext {
  return {
    cwd: '/Desktop',
    setCwd: vi.fn(),
    fs: {
      getNode: (path) => NODES[path] ?? null,
      listDirectory: (path) => DIRS[path] ?? null,
      resolvePath,
      getFileContent: (path) => FILES[path] ?? null,
    },
    openWindow: vi.fn(() => 'win-id'),
    triggerOverlay: vi.fn(),
    history: [],
    ...overrides,
  };
}
