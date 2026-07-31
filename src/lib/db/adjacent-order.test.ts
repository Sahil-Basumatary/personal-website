// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { pickAdjacentSwap } from './adjacent-order';

const ordered = [
  { id: 'a', order: 0 },
  { id: 'b', order: 1 },
  { id: 'c', order: 2 },
];

describe('pickAdjacentSwap', () => {
  it('swaps with the previous neighbor when moving up', () => {
    expect(pickAdjacentSwap(ordered, 'b', 'up')).toEqual({
      current: { id: 'b', order: 1 },
      target: { id: 'a', order: 0 },
    });
  });

  it('swaps with the next neighbor when moving down', () => {
    expect(pickAdjacentSwap(ordered, 'b', 'down')).toEqual({
      current: { id: 'b', order: 1 },
      target: { id: 'c', order: 2 },
    });
  });

  it('returns null at list edges or unknown ids', () => {
    expect(pickAdjacentSwap(ordered, 'a', 'up')).toBeNull();
    expect(pickAdjacentSwap(ordered, 'c', 'down')).toBeNull();
    expect(pickAdjacentSwap(ordered, 'missing', 'up')).toBeNull();
  });
});
