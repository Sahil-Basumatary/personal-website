// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowStore } from './window-store';

function open(title = 'Win') {
  return useWindowStore.getState().openWindow({
    title,
    component: 'terminal',
  });
}

beforeEach(() => {
  useWindowStore.setState({
    windows: {},
    activeWindowId: null,
    nextZIndex: 1,
    zoomEffect: null,
  });
});

describe('openWindow', () => {
  it('registers a window and makes it active on top', () => {
    const id = open();
    const state = useWindowStore.getState();
    expect(state.windows[id]).toBeDefined();
    expect(state.activeWindowId).toBe(id);
    expect(state.windows[id].zIndex).toBe(1);
    expect(state.nextZIndex).toBe(2);
  });

  it('cascades subsequent windows by an offset', () => {
    const first = open();
    const second = open();
    const { windows } = useWindowStore.getState();
    expect(windows[second].position.x).toBeGreaterThan(
      windows[first].position.x
    );
  });
});

describe('focus and close', () => {
  it('raises a focused window above the rest', () => {
    const first = open();
    const second = open();
    useWindowStore.getState().focusWindow(first);
    const { windows, activeWindowId } = useWindowStore.getState();
    expect(activeWindowId).toBe(first);
    expect(windows[first].zIndex).toBeGreaterThan(windows[second].zIndex);
  });

  it('reassigns the active window to the next top after close', () => {
    const first = open();
    const second = open();
    useWindowStore.getState().closeWindow(second);
    const state = useWindowStore.getState();
    expect(state.windows[second]).toBeUndefined();
    expect(state.activeWindowId).toBe(first);
  });
});

describe('resize and maximize', () => {
  it('clamps a resize below the minimum size', () => {
    const id = open();
    useWindowStore.getState().resizeWindow(id, { width: 50, height: 40 });
    const { size, minSize } = useWindowStore.getState().windows[id];
    expect(size.width).toBe(minSize.width);
    expect(size.height).toBe(minSize.height);
  });

  it('restores the previous bounds after maximizing', () => {
    const id = open();
    const before = { ...useWindowStore.getState().windows[id].size };
    useWindowStore.getState().maximizeWindow(id);
    expect(useWindowStore.getState().windows[id].isMaximized).toBe(true);
    useWindowStore.getState().restoreWindow(id);
    const after = useWindowStore.getState().windows[id];
    expect(after.isMaximized).toBe(false);
    expect(after.size).toEqual(before);
  });
});

describe('window zoom rectangles', () => {
  it('starts an open zoom when an origin rect is provided', () => {
    const origin = { x: 10, y: 20, width: 32, height: 32 };
    const id = useWindowStore.getState().openWindow({
      title: 'Finder',
      component: 'file-explorer',
      originRect: origin,
    });
    const state = useWindowStore.getState();
    expect(state.windows[id].isZoomingOpen).toBe(true);
    expect(state.windows[id].openOriginRect).toEqual(origin);
    expect(state.zoomEffect).toMatchObject({
      windowId: id,
      phase: 'open',
      from: origin,
    });
    useWindowStore.getState().completeZoomEffect();
    expect(useWindowStore.getState().windows[id].isZoomingOpen).toBe(false);
    expect(useWindowStore.getState().zoomEffect).toBeNull();
  });

  it('zooms back to the origin on close when known', () => {
    const origin = { x: 12, y: 24, width: 32, height: 32 };
    const id = useWindowStore.getState().openWindow({
      title: 'About Me',
      component: 'text-editor',
      originRect: origin,
    });
    useWindowStore.getState().completeZoomEffect();
    useWindowStore.getState().requestCloseWindow(id);
    const state = useWindowStore.getState();
    expect(state.windows[id].isZoomingClose).toBe(true);
    expect(state.zoomEffect).toMatchObject({
      windowId: id,
      phase: 'close',
      to: origin,
    });
    useWindowStore.getState().completeZoomEffect();
    expect(useWindowStore.getState().windows[id]).toBeUndefined();
  });
});
