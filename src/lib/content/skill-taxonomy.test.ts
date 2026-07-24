// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  isLanguageSkillCategory,
  isSkillCategory,
  isSkillProficiency,
  skillProficiencyFromLegacyScore,
} from './skill-taxonomy';

describe('skill taxonomy', () => {
  it('recognizes canonical categories and proficiency tiers', () => {
    expect(isSkillCategory('languages')).toBe(true);
    expect(isSkillCategory('Frontend')).toBe(false);
    expect(isSkillProficiency('intermediate')).toBe(true);
    expect(isSkillProficiency('expert')).toBe(false);
    expect(isLanguageSkillCategory('languages')).toBe(true);
    expect(isLanguageSkillCategory('frontend')).toBe(false);
  });

  it('maps legacy numeric scores onto proficiency tiers', () => {
    expect(skillProficiencyFromLegacyScore(20)).toBe('beginner');
    expect(skillProficiencyFromLegacyScore(55)).toBe('intermediate');
    expect(skillProficiencyFromLegacyScore(70)).toBe('advanced');
  });
});
