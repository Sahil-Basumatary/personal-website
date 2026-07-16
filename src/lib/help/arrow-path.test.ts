// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  arrowHeadPoints,
  buildHelpArrow,
  edgePointToward,
  rectCenter,
} from './arrow-path';

describe('arrow-path', () => {
  it('finds the border exit toward a target', () => {
    const rect = { x: 0, y: 0, width: 100, height: 40 };
    expect(rectCenter(rect)).toEqual({ x: 50, y: 20 });
    expect(edgePointToward(rect, { x: 200, y: 20 })).toEqual({
      x: 100,
      y: 20,
    });
  });

  it('builds a curved arrow from a card to an anchor', () => {
    const arrow = buildHelpArrow(
      { x: 40, y: 120, width: 320, height: 400 },
      { x: 900, y: 180, width: 70, height: 80 }
    );
    expect(arrow).not.toBeNull();
    expect(arrow?.path.startsWith('M ')).toBe(true);
    expect(arrow?.path.includes(' Q ')).toBe(true);
    expect(
      arrowHeadPoints(arrow!.tip, arrow!.tipAngle).split(' ')
    ).toHaveLength(3);
  });

  it('draws a longer curve when the card is nudged away from an icon', () => {
    const arrow = buildHelpArrow(
      { x: 480, y: 200, width: 320, height: 400 },
      { x: 1000, y: 280, width: 70, height: 80 }
    );
    expect(arrow).not.toBeNull();
    expect(arrow!.path.includes(' Q ')).toBe(true);
  });

  it('skips only impossible geometry', () => {
    expect(
      buildHelpArrow(
        { x: 0, y: 0, width: 0, height: 100 },
        { x: 200, y: 0, width: 40, height: 40 }
      )
    ).toBeNull();
  });
});
