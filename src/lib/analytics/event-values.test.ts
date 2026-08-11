// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  normalizeAnalyticsPath,
  normalizeAnalyticsWindowType,
} from './event-values';

describe('normalizeAnalyticsPath', () => {
  it('keeps safe site paths', () => {
    expect(normalizeAnalyticsPath('/')).toBe('/');
    expect(normalizeAnalyticsPath('/privacy')).toBe('/privacy');
  });

  it('rejects protocol-relative and absolute URLs', () => {
    expect(normalizeAnalyticsPath('//evil.test')).toBeNull();
    expect(normalizeAnalyticsPath('https://evil.test')).toBeNull();
    expect(normalizeAnalyticsPath('/\\windows')).toBeNull();
  });
});

describe('normalizeAnalyticsWindowType', () => {
  it('allows known desktop apps only', () => {
    expect(normalizeAnalyticsWindowType('terminal')).toBe('terminal');
    expect(normalizeAnalyticsWindowType('simpletext')).toBe('simpletext');
    expect(normalizeAnalyticsWindowType('mystery-app')).toBeNull();
  });
});
