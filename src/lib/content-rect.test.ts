import { describe, it, expect, afterEach, vi } from 'vitest';
import { measureOriginRect, rectRelativeToContainer } from './content-rect';

describe('rectRelativeToContainer', () => {
  it('returns the element rect relative to the container', () => {
    const element = {
      getBoundingClientRect: () => ({
        left: 120,
        top: 80,
        width: 40,
        height: 32,
        right: 160,
        bottom: 112,
        x: 120,
        y: 80,
        toJSON: () => ({}),
      }),
    } as Element;
    const container = {
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        width: 800,
        height: 600,
        right: 900,
        bottom: 650,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      }),
    } as Element;

    expect(rectRelativeToContainer(element, container)).toEqual({
      x: 20,
      y: 30,
      width: 40,
      height: 32,
    });
  });
});

describe('measureOriginRect', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('returns undefined when the desktop content root is missing', () => {
    expect(measureOriginRect(document.createElement('div'))).toBeUndefined();
  });

  it('measures against .os-content when present', () => {
    const container = document.createElement('div');
    container.className = 'os-content';
    document.body.appendChild(container);
    const origin = document.createElement('div');
    container.appendChild(origin);

    vi.spyOn(origin, 'getBoundingClientRect').mockReturnValue({
      left: 150,
      top: 90,
      width: 32,
      height: 32,
      right: 182,
      bottom: 122,
      x: 150,
      y: 90,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 40,
      width: 900,
      height: 700,
      right: 1000,
      bottom: 740,
      x: 100,
      y: 40,
      toJSON: () => ({}),
    } as DOMRect);

    expect(measureOriginRect(origin)).toEqual({
      x: 50,
      y: 50,
      width: 32,
      height: 32,
    });
  });
});
