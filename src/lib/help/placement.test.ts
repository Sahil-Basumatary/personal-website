// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { edgeClearance, placeHelpCard } from './placement';

describe('placeHelpCard', () => {
  const card = { width: 320, height: 400 };
  const viewport = { width: 1200, height: 800 };

  it('falls back to the bottom-left when no anchor exists', () => {
    expect(
      placeHelpCard({
        anchor: null,
        card,
        viewport,
      })
    ).toEqual({ left: 12, top: 356 });
  });

  it('nudges left of a right-side icon with long arrow clearance', () => {
    const anchor = { x: 1000, y: 200, width: 80, height: 70 };
    const placed = placeHelpCard({
      anchor,
      card,
      viewport,
    });
    expect(
      edgeClearance(placed.left, placed.top, card, anchor)
    ).toBeGreaterThanOrEqual(120);
    expect(placed.left + card.width).toBeLessThanOrEqual(anchor.x - 120);
  });

  it('places to the right of a left-side anchor when space allows', () => {
    const anchor = { x: 40, y: 120, width: 80, height: 60 };
    const placed = placeHelpCard({
      anchor,
      card,
      viewport,
    });
    expect(placed.left).toBeGreaterThanOrEqual(anchor.x + anchor.width + 120);
  });

  it('sits above a wide bottom dock so the arrow can run long', () => {
    const dock = { x: 200, y: 720, width: 800, height: 56 };
    const placed = placeHelpCard({
      anchor: dock,
      card,
      viewport,
    });
    expect(placed.top + card.height).toBeLessThanOrEqual(dock.y - 100);
    expect(
      edgeClearance(placed.left, placed.top, card, dock)
    ).toBeGreaterThanOrEqual(100);
  });

  it('clamps into the viewport on tiny screens', () => {
    const placed = placeHelpCard({
      anchor: { x: 10, y: 10, width: 40, height: 40 },
      card: { width: 300, height: 500 },
      viewport: { width: 320, height: 520 },
    });
    expect(placed.left).toBeGreaterThanOrEqual(0);
    expect(placed.top).toBeGreaterThanOrEqual(0);
    expect(placed.left + 300).toBeLessThanOrEqual(320);
    expect(placed.top + 500).toBeLessThanOrEqual(520);
  });
});
