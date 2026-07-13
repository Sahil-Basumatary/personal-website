import { describe, it, expect, vi } from 'vitest';
import { nextUntitledTitle, openUntitledDocument } from './window-titles';

describe('nextUntitledTitle', () => {
  it('uses lowercase untitled for the first new document', () => {
    expect(nextUntitledTitle([])).toBe('untitled');
    expect(nextUntitledTitle(['Browser', 'Terminal'])).toBe('untitled');
  });

  it('numbers later untitled windows starting at 2', () => {
    expect(nextUntitledTitle(['untitled'])).toBe('untitled 2');
    expect(nextUntitledTitle(['untitled', 'untitled 2'])).toBe('untitled 3');
    expect(nextUntitledTitle(['untitled', 'untitled 3'])).toBe('untitled 2');
  });
});

describe('openUntitledDocument', () => {
  it('opens text-editor with the next untitled title', () => {
    const openWindow = vi.fn().mockReturnValue('w1');
    openUntitledDocument(openWindow, ['untitled']);
    expect(openWindow).toHaveBeenCalledWith({
      title: 'untitled 2',
      component: 'text-editor',
      size: { width: 500, height: 350 },
    });
  });
});
