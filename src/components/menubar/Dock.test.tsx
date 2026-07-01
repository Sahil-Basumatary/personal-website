import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dock } from './Dock';
import { useWindowStore } from '@/stores/window-store';

beforeEach(() => {
  useWindowStore.setState({ windows: {}, activeWindowId: null, nextZIndex: 1 });
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Dock', () => {
  it('shows no restorable items when nothing is minimized', () => {
    render(<Dock />);
    expect(screen.queryByRole('button', { name: 'Terminal' })).toBeNull();
  });

  it('lists a minimized window and restores it on click', () => {
    const id = useWindowStore
      .getState()
      .openWindow({ title: 'Terminal', component: 'terminal' });
    useWindowStore.getState().minimizeWindow(id);

    render(<Dock />);
    fireEvent.click(screen.getByRole('button', { name: 'Terminal' }));

    expect(useWindowStore.getState().windows[id].isMinimized).toBe(false);
  });
});
