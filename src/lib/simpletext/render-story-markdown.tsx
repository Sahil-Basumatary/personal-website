import type { ReactNode } from 'react';
import { openExternalUrl } from '@/lib/open-external';
import type { StoryBlock, StoryInline } from './parse-story-markdown';

function renderInline(nodes: StoryInline[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case 'text':
        return <span key={key}>{node.text}</span>;
      case 'strong':
        return <strong key={key}>{renderInline(node.children, key)}</strong>;
      case 'em':
        return <em key={key}>{renderInline(node.children, key)}</em>;
      case 'code':
        return (
          <code key={key} className="simpletext-code">
            {node.text}
          </code>
        );
      case 'link':
        return (
          <button
            key={key}
            type="button"
            className="simpletext-link"
            onClick={() => openExternalUrl(node.href)}
          >
            {renderInline(node.children, key)}
          </button>
        );
    }
  });
}

export function renderStoryBlocks(blocks: StoryBlock[]): ReactNode {
  return blocks.map((block, index) => {
    const key = `block-${index}`;
    switch (block.type) {
      case 'heading': {
        const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3';
        return (
          <Tag key={key} className={`simpletext-h${block.level}`}>
            {renderInline(block.children, key)}
          </Tag>
        );
      }
      case 'paragraph':
        return (
          <p key={key} className="simpletext-p">
            {renderInline(block.children, key)}
          </p>
        );
      case 'list':
        return (
          <ul key={key} className="simpletext-ul">
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-${itemIndex}`}>
                {renderInline(item, `${key}-${itemIndex}`)}
              </li>
            ))}
          </ul>
        );
    }
  });
}
