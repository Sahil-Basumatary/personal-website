import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileExplorer } from './FileExplorer';
import { useFileSystemStore } from '@/stores/file-system-store';
import { useWindowStore } from '@/stores/window-store';
import { SYSTEM_DRIVE } from '@/lib/content/tree';

beforeEach(() => {
  useFileSystemStore.setState({ root: structuredClone(SYSTEM_DRIVE) });
  useWindowStore.setState({ windows: {}, activeWindowId: null, nextZIndex: 1 });
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FileExplorer', () => {
  it('shows empty-folder copy for a valid empty directory', () => {
    render(<FileExplorer initialPath="/Trash" />);
    expect(screen.getByText('This folder is empty')).toBeInTheDocument();
  });

  it('shows missing-folder recovery for an invalid path', () => {
    render(<FileExplorer initialPath="/does/not/exist" />);
    expect(
      screen.getByText(/The folder “exist” could not be found/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open Macintosh HD' }));
    expect(screen.queryByText(/could not be found/i)).toBeNull();
  });
});
