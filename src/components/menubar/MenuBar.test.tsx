import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuBar } from './MenuBar';
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

describe('MenuBar', () => {
  it('opens and closes a menu when its trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<MenuBar />);
    const fileTrigger = screen.getByRole('menuitem', { name: 'File' });

    await user.click(fileTrigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('New Window')).toBeInTheDocument();

    await user.click(fileTrigger);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes the open menu on Escape', async () => {
    const user = userEvent.setup();
    render(<MenuBar />);
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes when a pointer lands outside the menu bar', async () => {
    const user = userEvent.setup();
    render(<MenuBar />);
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens a new window from the File menu', async () => {
    const user = userEvent.setup();
    render(<MenuBar />);
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    await user.click(screen.getByRole('menuitem', { name: /New Window/ }));
    const windows = Object.values(useWindowStore.getState().windows);
    expect(windows).toHaveLength(1);
    expect(windows[0]?.title).toBe('untitled');
    expect(windows[0]?.component).toBe('text-editor');
  });
});
