import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { SimpleText } from './SimpleText';
import { useFileSystemStore } from '@/stores/file-system-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { PROJECT_STORY_FILENAME } from '@/lib/content/build-system-drive';
import type { FolderNode } from '@/types/file-system';
import type { PortfolioContent } from '@/types/portfolio';

const STORY_PATH = `/Desktop/Projects/demo/${PROJECT_STORY_FILENAME}`;

const sampleMarkdown = [
  '# Demo Project',
  '',
  'A short **portfolio** story with *emphasis* and `code`.',
  '',
  '- First point',
  '- Second point',
  '',
  'Visit [example](https://example.com) for more.',
].join('\n');

const sampleContent: PortfolioContent = {
  about: '',
  skills: {},
  projects: [
    {
      slug: 'demo',
      title: 'Demo',
      summary: 'Summary',
      readme: sampleMarkdown,
      techStack: ['TypeScript'],
      liveUrl: null,
      githubUrl: null,
      images: [
        {
          url: '/wallpapers/adult-2026.webp',
          alt: 'Demo wallpaper preview',
          caption: 'Sample caption',
          order: 0,
        },
      ],
    },
  ],
};

const sampleRoot: FolderNode = {
  name: 'Macintosh HD',
  kind: 'folder',
  children: {
    Desktop: {
      name: 'Desktop',
      kind: 'folder',
      children: {
        Projects: {
          name: 'Projects',
          kind: 'folder',
          children: {
            demo: {
              name: 'demo',
              kind: 'folder',
              children: {
                [PROJECT_STORY_FILENAME]: {
                  name: PROJECT_STORY_FILENAME,
                  kind: 'file',
                  content: sampleMarkdown,
                },
              },
            },
          },
        },
      },
    },
  },
};

function SimpleTextStage({ withGallery }: { withGallery: boolean }) {
  useEffect(() => {
    useFileSystemStore.getState().hydrateRoot(sampleRoot);
    usePortfolioStore.getState().setContent({
      ...sampleContent,
      projects: sampleContent.projects.map((project) => ({
        ...project,
        images: withGallery ? project.images : [],
      })),
    });
  }, [withGallery]);

  return (
    <div
      className="window-content"
      style={{ width: 520, height: 440, border: '2px solid #666' }}
    >
      <SimpleText filePath={STORY_PATH} />
    </div>
  );
}

const meta: Meta<typeof SimpleTextStage> = {
  title: 'Phase12/SimpleText',
  component: SimpleTextStage,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithGallery: Story = {
  args: { withGallery: true },
};

export const TextOnly: Story = {
  args: { withGallery: false },
};
