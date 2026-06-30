// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildCowsay,
  pickRandom,
  FORTUNES,
  KONAMI_SEQUENCE,
} from './easter-eggs';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildCowsay', () => {
  it('wraps a message in a speech bubble with the cow art', () => {
    const lines = buildCowsay('moo');
    expect(lines[1]).toBe('< moo >');
    expect(lines.some((line) => line.includes('^__^'))).toBe(true);
  });

  it('falls back to "Moo." for an empty message', () => {
    expect(buildCowsay('   ')[1]).toBe('< Moo. >');
  });

  it('truncates messages longer than 40 characters', () => {
    const lines = buildCowsay('x'.repeat(60));
    expect(lines[1]).toBe(`< ${'x'.repeat(40)} >`);
  });
});

describe('pickRandom', () => {
  it('returns an element from the array', () => {
    expect(FORTUNES).toContain(pickRandom(FORTUNES));
  });

  it('picks deterministically given a fixed random seed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickRandom(FORTUNES)).toBe(FORTUNES[0]);
  });
});

describe('konami sequence', () => {
  it('is the classic ten-key code', () => {
    expect(KONAMI_SEQUENCE).toHaveLength(10);
    expect(KONAMI_SEQUENCE.slice(-2)).toEqual(['b', 'a']);
  });
});
