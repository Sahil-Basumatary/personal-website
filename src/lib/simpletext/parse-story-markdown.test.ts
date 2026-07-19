// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  parseInlineMarkdown,
  parseStoryMarkdown,
} from './parse-story-markdown';

describe('parseStoryMarkdown', () => {
  it('parses headings, paragraphs, lists and inline marks', () => {
    const blocks = parseStoryMarkdown(
      [
        '# Title',
        '',
        'Hello **world** and *italics* plus `code`.',
        '',
        '- one',
        '- two',
        '',
        'See [site](https://example.com) please.',
      ].join('\n')
    );
    expect(blocks[0]).toMatchObject({ type: 'heading', level: 1 });
    expect(blocks[1]?.type).toBe('paragraph');
    expect(blocks[2]).toMatchObject({ type: 'list' });
    expect(blocks[3]?.type).toBe('paragraph');
  });

  it('keeps unsafe link syntax as plain text', () => {
    const parts = parseInlineMarkdown('[x](javascript:alert(1))');
    expect(parts.some((part) => part.type === 'link')).toBe(false);
    expect(
      parts.map((part) => (part.type === 'text' ? part.text : '')).join('')
    ).toBe('[x](javascript:alert(1))');
  });
});
