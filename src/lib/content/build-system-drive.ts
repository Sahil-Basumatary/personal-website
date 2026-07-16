import type {
  PortfolioContent,
  PortfolioProject,
  PortfolioProjectMeta,
} from '@/types/portfolio';
import type {
  AliasNode,
  AppNode,
  FileNode,
  FolderNode,
  FSNode,
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

function alias(name: string, target: string): AliasNode {
  return { name, kind: 'alias', target };
}

export function toProjectMetaFile(
  project: PortfolioProject
): PortfolioProjectMeta {
  return {
    title: project.title,
    summary: project.summary,
    techStack: [...project.techStack],
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
  };
}

function projectFolder(project: PortfolioProject): FolderNode {
  const items: FSNode[] = [
    file('README.md', project.readme),
    file(
      'tech-stack.json',
      JSON.stringify(toProjectMetaFile(project), null, 2)
    ),
  ];
  if (project.liveUrl) {
    items.push(alias('Live Site', project.liveUrl));
  }
  if (project.githubUrl) {
    items.push(alias('GitHub', project.githubUrl));
  }
  return folder(project.slug, items);
}

const CONTACT_FILE = [
  'Email:     sahil@sahilbasumatary.dev',
  'GitHub:    github.com/Sahil-Basumatary',
  'Website:   sahilbzy.com',
  'Blog:      blog.sahilbzy.com',
].join('\n');

const DRIVE_README = [
  '# Macintosh HD',
  '',
  'Format:    HFS+',
  'Capacity:  whatever it takes',
  'Created:   2025',
  'Owner:     sahil basumatary',
  '',
  "It's not what you know often, but who you know always.",
].join('\n');

export function buildSystemDrive(content: PortfolioContent): FolderNode {
  return folder('Macintosh HD', [
    folder('Desktop', [
      file('About Me', content.about),
      folder('Projects', content.projects.map(projectFolder)),
      file('Skills.json', JSON.stringify(content.skills, null, 2)),
      file('Contact', CONTACT_FILE),
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
      app('Help', 'help'),
    ]),
    folder('Trash', []),
    file('README.md', DRIVE_README),
  ]);
}
