import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnknownApplication } from './UnknownApplication';
import { useWindowStore } from '@/stores/window-store';

beforeEach(() => {
  useWindowStore.setState({ windows: {}, activeWindowId: null, nextZIndex: 1 });
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
  );
  const id = useWindowStore.getState().openWindow({
    title: 'Mystery',
    component: 'mystery-app',
  });
  useWindowStore.setState({ activeWindowId: id });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UnknownApplication', () => {
  it('explains the missing application and closes on OK', () => {
    const windowId = useWindowStore.getState().activeWindowId!;
    render(<UnknownApplication windowId={windowId} component="mystery-app" />);
    expect(
      screen.getByRole('alertdialog', {
        name: /mystery-app.*could not be found/i,
      })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(useWindowStore.getState().windows[windowId]).toBeUndefined();
  });
});
