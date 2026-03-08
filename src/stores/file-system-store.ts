import { create } from 'zustand';
import type {
  FSNode,
  FolderNode,
  FileNode,
  AppNode,
} from '@/types/file-system';

function file(name: string, content: string): FileNode {
  return { name, kind: 'file', content };
}

function folder(name: string, items: FSNode[]): FolderNode {
  const children: Record<string, FSNode> = {};
  for (const item of items) {
    children[item.name] = item;
  }
  return { name, kind: 'folder', children };
}

function app(name: string, component: string): AppNode {
  return { name, kind: 'app', component };
}

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  if (dot <= 0) return '';
  return fileName.slice(dot + 1).toLowerCase();
}

export function resolvePath(cwd: string, relative: string): string {
  const raw = relative.startsWith('/') ? relative : cwd + '/' + relative;
  const segments = raw.split('/');
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      resolved.pop();
    } else {
      resolved.push(seg);
    }
  }
  return '/' + resolved.join('/');
}

function traverseToNode(root: FolderNode, path: string): FSNode | null {
  const normalized = resolvePath('/', path);
  if (normalized === '/') return root;
  const segments = normalized.split('/').filter(Boolean);
  let current: FSNode = root;
  for (const segment of segments) {
    if (current.kind !== 'folder') return null;
    const child: FSNode | undefined = current.children[segment];
    if (!child) return null;
    current = child;
  }
  return current;
}

const ROOT: FolderNode = folder('Macintosh HD', [
  folder('Desktop', [
    file(
      'About Me',
      [
        'Sahil Basumatary',
        '=================',
        "CS @ King's College London",
        '',
        "I set targets every day and work until they're done.",
        '',
        'Open source collaborator, community first. I lead from the',
        "front and I don't cut corners.",
        '',
        "I only prioritise work that keeps me awake — if it doesn't",
        "excite me, I won't build it.",
        '',
        'Poker. Tennis court. Saint-Tropez when I can.',
        '',
        "First one in, last one to leave. I don't really do breaks.",
        'But I connect with people fast — give me five minutes and',
        "we'll have a genuine conversation.",
      ].join('\n')
    ),
    folder('Projects', [
      file(
        'personal-blog.md',
        [
          '# Personal Blog',
          '',
          "My journal where I write about what I'm learning, my experiences,",
          'and just life.',
          '',
          'React, Express, Clerk, PostgreSQL',
          'blog.sahilbzy.com',
        ].join('\n')
      ),
      file(
        'pioni.md',
        [
          '# Pioni',
          '',
          'Live trading intelligence platform. Reads human emotions',
          'and social sentiment to surface insights before the market',
          'moves.',
          '',
          'Python, FastAPI, PostgreSQL',
        ].join('\n')
      ),
      file(
        'tennisly.md',
        [
          '# Tennisly',
          '',
          'Interactive tennis match visualization and data analytics.',
          '',
          'Java, Spring Boot, PostgreSQL, React',
          'Work in progress.',
        ].join('\n')
      ),
    ]),
    file(
      'Skills.json',
      JSON.stringify(
        {
          languages: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'],
          frontend: ['React', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
          backend: ['Node.js', 'Express', 'FastAPI', 'Spring Boot'],
          tools: ['Git', 'Docker', 'PostgreSQL', 'MongoDB', 'Vercel'],
          interests: ['Distributed Systems', 'Machine Learning', 'Open Source'],
        },
        null,
        2
      )
    ),
    file(
      'Contact',
      [
        'Email:     sahil@sahilbasumatary.dev',
        'GitHub:    github.com/Sahil-Basumatary',
        'Website:   sahilbzy.com',
        'Blog:      blog.sahilbzy.com',
      ].join('\n')
    ),
    folder('Games', []),
  ]),
  folder('Documents', [file('Blog.webloc', 'https://blog.sahilbzy.com')]),
  folder('Applications', [
    app('Terminal', 'terminal'),
    app('Text Editor', 'text-editor'),
    app('Code Playground', 'code-playground'),
    app('Browser', 'browser'),
  ]),
  folder('Trash', []),
  file(
    'README.md',
    [
      '# Macintosh HD',
      '',
      'Format:    HFS+',
      'Capacity:  whatever it takes',
      'Created:   2025',
      'Owner:     sahil basumatary',
      '',
      "It's not what you know often, but who you know always.",
    ].join('\n')
  ),
]);

interface FileSystemState {
  root: FolderNode;
  getNode: (path: string) => FSNode | null;
  listDirectory: (path: string) => FSNode[] | null;
  resolvePath: (cwd: string, relative: string) => string;
  getFileContent: (path: string) => string | null;
}

export const useFileSystemStore = create<FileSystemState>()((_, get) => ({
  root: ROOT,
  getNode: (path) => traverseToNode(get().root, path),
  listDirectory: (path) => {
    const node = traverseToNode(get().root, path);
    if (!node || node.kind !== 'folder') return null;
    return Object.values(node.children);
  },
  resolvePath,
  getFileContent: (path) => {
    const node = traverseToNode(get().root, path);
    if (!node || node.kind !== 'file') return null;
    return node.content;
  },
}));
