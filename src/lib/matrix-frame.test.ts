import { describe, it, expect, vi } from 'vitest';
import {
  MATRIX_FONT_SIZE,
  buildStaticMatrixCells,
  paintMatrixCells,
} from './matrix-frame';

describe('buildStaticMatrixCells', () => {
  it('builds a deterministic static frame from a seeded random', () => {
    let n = 0;
    const random = () => {
      n += 1;
      return (n % 10) / 10;
    };
    const cells = buildStaticMatrixCells(
      MATRIX_FONT_SIZE * 2,
      MATRIX_FONT_SIZE * 4,
      random
    );
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.every((cell) => cell.char.length === 1)).toBe(true);
    expect(cells.some((cell) => cell.head)).toBe(true);
  });
});

describe('paintMatrixCells', () => {
  it('clears the canvas and draws every cell', () => {
    const fillRect = vi.fn();
    const fillText = vi.fn();
    const ctx = {
      fillStyle: '',
      font: '',
      globalAlpha: 1,
      fillRect,
      fillText,
    };
    const cells = [
      { x: 0, y: 16, char: 'A', head: true, alpha: 1 },
      { x: 16, y: 16, char: 'B', head: false, alpha: 0.5 },
    ];
    paintMatrixCells(ctx, 32, 32, cells);
    expect(fillRect).toHaveBeenCalledWith(0, 0, 32, 32);
    expect(fillText).toHaveBeenCalledTimes(2);
    expect(ctx.globalAlpha).toBe(1);
  });
});
