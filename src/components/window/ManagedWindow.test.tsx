import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManagedWindow } from './ManagedWindow';
import { useWindowStore } from '@/stores/window-store';

beforeEach(() => {
  useWindowStore.setState({ windows: {}, activeWindowId: null, nextZIndex: 1 });
  // Window open tracks an analytics beacon; stub the network so it stays quiet.
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function openTestWindow() {
  return useWindowStore
    .getState()
    .openWindow({ title: 'Terminal', component: 'terminal' });
}

describe('ManagedWindow', () => {
  it('renders the window title', () => {
    const id = openTestWindow();
    render(
      <ManagedWindow windowId={id}>
        <div>body</div>
      </ManagedWindow>
    );
    expect(screen.getByText('Terminal')).toBeInTheDocument();
  });

  it('closes the window when the close box is clicked', () => {
    const id = openTestWindow();
    render(
      <ManagedWindow windowId={id}>
        <div>body</div>
      </ManagedWindow>
    );
    fireEvent.click(screen.getByLabelText('Close window'));
    expect(useWindowStore.getState().windows[id]).toBeUndefined();
  });

  it('toggles maximize state via the zoom box', () => {
    const id = openTestWindow();
    render(
      <ManagedWindow windowId={id}>
        <div>body</div>
      </ManagedWindow>
    );
    const zoom = screen.getByLabelText('Zoom window');
    fireEvent.click(zoom);
    expect(useWindowStore.getState().windows[id].isMaximized).toBe(true);
    fireEvent.click(zoom);
    expect(useWindowStore.getState().windows[id].isMaximized).toBe(false);
  });

  it('collapses and expands via the collapse box', () => {
    const id = openTestWindow();
    render(
      <ManagedWindow windowId={id}>
        <div>body</div>
      </ManagedWindow>
    );
    fireEvent.click(screen.getByLabelText('Collapse window'));
    expect(useWindowStore.getState().windows[id].isCollapsed).toBe(true);
    fireEvent.click(screen.getByLabelText('Expand window'));
    expect(useWindowStore.getState().windows[id].isCollapsed).toBe(false);
  });

  it('renders nothing for an unknown window id', () => {
    const { container } = render(
      <ManagedWindow windowId="missing">
        <div>body</div>
      </ManagedWindow>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('contains a crashed app without tearing down the chrome', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function Boom(): never {
      throw new Error('app boom');
    }
    const id = openTestWindow();
    render(
      <ManagedWindow windowId={id}>
        <Boom />
      </ManagedWindow>
    );
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(
      screen.getByRole('alertdialog', {
        name: /Terminal.*unexpectedly quit/i,
      })
    ).toBeInTheDocument();
    expect(useWindowStore.getState().windows[id]).toBeDefined();
  });
});
