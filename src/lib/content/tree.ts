import type {
  FSNode,
  FolderNode,
  FileNode,
  AppNode,
  AliasNode,
} from '@/types/file-system';
import { PROJECTS, type ProjectMeta } from './projects';

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

function alias(name: string, target: string): AliasNode {
  return { name, kind: 'alias', target };
}

function projectFolder(meta: ProjectMeta): FolderNode {
  const items: FSNode[] = [
    file('README.md', meta.readme),
    file('tech-stack.json', JSON.stringify(meta.techStack, null, 2)),
  ];
  if (meta.techStack.liveUrl) {
    items.push(alias('Live Site', meta.techStack.liveUrl));
  }
  if (meta.techStack.githubUrl) {
    items.push(alias('GitHub', meta.techStack.githubUrl));
  }
  return folder(meta.slug, items);
}

export const SYSTEM_DRIVE: FolderNode = folder('Macintosh HD', [
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
    folder('Projects', PROJECTS.map(projectFolder)),
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
    folder('Games', [app('Minesweeper', 'minesweeper')]),
  ]),
  folder('Documents', [
    file('Blog.webloc', 'https://blog.sahilbzy.com'),
    folder('Blog Posts', [
      file('Loading…', 'Loading recent posts from blog.sahilbzy.com...'),
    ]),
  ]),
  folder('Applications', [
    app('Terminal', 'terminal'),
    app('Text Editor', 'text-editor'),
    app('Code Playground', 'code-playground'),
    app('Browser', 'browser'),
    app('Minesweeper', 'minesweeper'),
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
