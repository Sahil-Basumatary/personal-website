// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  isLanguageSkillCategory,
  isSkillCategory,
  isSkillLevel,
  skillLevelFromProficiency,
} from './skill-taxonomy';

describe('skill taxonomy', () => {
  it('recognizes canonical categories and levels', () => {
    expect(isSkillCategory('languages')).toBe(true);
    expect(isSkillCategory('Frontend')).toBe(false);
    expect(isSkillLevel('intermediate')).toBe(true);
    expect(isSkillLevel('expert')).toBe(false);
    expect(isLanguageSkillCategory('languages')).toBe(true);
    expect(isLanguageSkillCategory('frontend')).toBe(false);
  });

  it('maps legacy proficiency scores onto levels', () => {
    expect(skillLevelFromProficiency(20)).toBe('beginner');
    expect(skillLevelFromProficiency(55)).toBe('intermediate');
    expect(skillLevelFromProficiency(70)).toBe('advanced');
  });
});
