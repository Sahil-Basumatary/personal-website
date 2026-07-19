'use client';

import { useMemo } from 'react';
import { useFileSystemStore } from '@/stores/file-system-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { parseStoryMarkdown } from '@/lib/simpletext/parse-story-markdown';
import { renderStoryBlocks } from '@/lib/simpletext/render-story-markdown';
import { projectSlugFromStoryPath } from '@/lib/simpletext/project-story-path';
import type { PortfolioStoryImage } from '@/types/portfolio';

interface SimpleTextProps {
  filePath?: string;
}

function StoryGallery({ images }: { images: PortfolioStoryImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="simpletext-gallery" aria-label="Project images">
      {images.map((image) => (
        <figure
          key={`${image.order}-${image.url}`}
          className="simpletext-figure"
        >
          {/* Public R2 URLs; host is CSP-allowlisted via R2_PUBLIC_BASE_URL. */}
          <img src={image.url} alt={image.alt} className="simpletext-image" />
          {image.caption ? (
            <figcaption className="simpletext-caption">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </section>
  );
}

export function SimpleText({ filePath }: SimpleTextProps) {
  const getFileContent = useFileSystemStore((s) => s.getFileContent);
  const content = usePortfolioStore((s) => s.content);

  const slug = filePath ? projectSlugFromStoryPath(filePath) : null;
  const markdown = filePath ? getFileContent(filePath) : null;
  const project = content?.projects.find((item) => item.slug === slug);
  const images = project?.images ?? [];

  const blocks = useMemo(
    () => (markdown ? parseStoryMarkdown(markdown) : []),
    [markdown]
  );

  if (!filePath) {
    return (
      <div className="simpletext">
        <div className="simpletext-empty">
          <p className="simpletext-empty-title">SimpleText</p>
          <p className="simpletext-empty-hint">
            Open a project story from Finder.
          </p>
        </div>
      </div>
    );
  }

  if (markdown === null) {
    return (
      <div className="simpletext">
        <div className="simpletext-empty">
          <p className="simpletext-empty-title">Document not found</p>
          <p className="simpletext-empty-hint">{filePath}</p>
        </div>
        <div className="simpletext-statusbar">
          <span>SimpleText</span>
          <span className="simpletext-badge">Read-Only</span>
        </div>
      </div>
    );
  }

  return (
    <div className="simpletext">
      <div className="simpletext-body">
        <article className="simpletext-document">
          <StoryGallery images={images} />
          <div className="simpletext-prose">{renderStoryBlocks(blocks)}</div>
        </article>
      </div>
      <div className="simpletext-statusbar">
        <span className="simpletext-statusbar-left">
          {slug ? `${slug} · SimpleText` : 'SimpleText'}
        </span>
        <span className="simpletext-badge">Read-Only</span>
      </div>
    </div>
  );
}
