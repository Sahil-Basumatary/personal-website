// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { clipColumn, formatTechTags } from './portfolio-format';

describe('formatTechTags', () => {
  it('joins cleaned tags', () => {
    expect(formatTechTags([' React ', '', 'Neon'])).toBe('React, Neon');
  });

  it('returns an em dash when empty', () => {
    expect(formatTechTags([])).toBe('—');
    expect(formatTechTags(['', '  '])).toBe('—');
  });
});

describe('clipColumn', () => {
  it('returns the text when it fits', () => {
    expect(clipColumn('hello', 10)).toBe('hello');
  });

  it('truncates with an ellipsis when needed', () => {
    expect(clipColumn('abcdefghij', 5)).toBe('abcd…');
  });

  it('handles tiny widths', () => {
    expect(clipColumn('abc', 0)).toBe('');
    expect(clipColumn('abc', 1)).toBe('…');
  });
});
