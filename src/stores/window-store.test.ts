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
