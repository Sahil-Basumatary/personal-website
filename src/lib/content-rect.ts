export interface ContentRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const OS_CONTENT_SELECTOR = '.os-content';
export const WINDOW_TITLEBAR_HEIGHT = 22;
export const WINDOW_ZOOM_DURATION_MS = 220;

export function rectRelativeToContainer(
  element: Element,
  container: Element
): ContentRect {
  const a = element.getBoundingClientRect();
  const b = container.getBoundingClientRect();
  return {
    x: a.left - b.left,
    y: a.top - b.top,
    width: Math.max(1, a.width),
    height: Math.max(1, a.height),
  };
}

export function measureOriginRect(
  origin: Element | null | undefined
): ContentRect | undefined {
  if (!origin || typeof document === 'undefined') return undefined;
  const container = document.querySelector(OS_CONTENT_SELECTOR);
  if (!container) return undefined;
  return rectRelativeToContainer(origin, container);
}
