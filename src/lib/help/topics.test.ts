// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  HELP_CARD_IDS,
  HELP_CARDS,
  clampHelpStep,
  getHelpCard,
  isHelpCardId,
  isLastHelpStep,
  listHelpCards,
  nextHelpStep,
  prevHelpStep,
} from './topics';

describe('help cards', () => {
  it('covers the Phase 12 help subjects as stepped cards', () => {
    expect(HELP_CARD_IDS).toEqual([
      'windows',
      'filesystem',
      'terminal',
      'playground',
      'gestures',
      'easter-eggs',
    ]);
    expect(listHelpCards()).toHaveLength(HELP_CARD_IDS.length);
  });

  it('keeps each card short and anchored', () => {
    for (const card of HELP_CARDS) {
      expect(card.headline.trim().length).toBeGreaterThan(0);
      expect(card.headline.length).toBeLessThanOrEqual(40);
      expect(card.body.trim().length).toBeGreaterThan(0);
      expect(card.body.length).toBeLessThanOrEqual(160);
      expect(card.visual).toBe(card.id);
      expect(card.anchor.length).toBeGreaterThan(0);
      expect(card.arrowLabel.trim().length).toBeGreaterThan(0);
    }
  });

  it('looks up cards and clamps step navigation', () => {
    expect(isHelpCardId('terminal')).toBe(true);
    expect(isHelpCardId('sosumi')).toBe(false);
    expect(getHelpCard('playground')?.headline).toMatch(/code/i);
    expect(getHelpCard('missing')).toBeUndefined();
    expect(clampHelpStep(-2)).toBe(0);
    expect(clampHelpStep(99)).toBe(HELP_CARDS.length - 1);
    expect(nextHelpStep(0)).toBe(1);
    expect(prevHelpStep(0)).toBe(0);
    expect(isLastHelpStep(HELP_CARDS.length - 1)).toBe(true);
    expect(isLastHelpStep(0)).toBe(false);
    expect(clampHelpStep(0, 0)).toBe(0);
    expect(isLastHelpStep(0, 0)).toBe(true);
  });
});
