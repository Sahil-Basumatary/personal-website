/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { HELP_CARDS } from '@/lib/help/topics';
import { openHelpCenter, useHelpStore } from './help-store';

beforeEach(() => {
  useHelpStore.setState({ isOpen: false, stepIndex: 0 });
});

describe('help-store', () => {
  it('opens on the first card and closes from the last Next', () => {
    openHelpCenter();
    expect(useHelpStore.getState().isOpen).toBe(true);
    expect(useHelpStore.getState().stepIndex).toBe(0);
    for (let i = 0; i < HELP_CARDS.length - 1; i += 1) {
      useHelpStore.getState().next();
    }
    expect(useHelpStore.getState().stepIndex).toBe(HELP_CARDS.length - 1);
    useHelpStore.getState().next();
    expect(useHelpStore.getState().isOpen).toBe(false);
  });

  it('supports back and direct goTo', () => {
    openHelpCenter();
    useHelpStore.getState().goTo(3);
    expect(useHelpStore.getState().stepIndex).toBe(3);
    useHelpStore.getState().back();
    expect(useHelpStore.getState().stepIndex).toBe(2);
    useHelpStore.getState().close();
    expect(useHelpStore.getState().isOpen).toBe(false);
  });
});
