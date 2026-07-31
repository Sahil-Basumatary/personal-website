// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { parseMessagesPage } from './pagination';

describe('parseMessagesPage', () => {
  it('defaults invalid values to page 1', () => {
    expect(parseMessagesPage(undefined)).toBe(1);
    expect(parseMessagesPage('')).toBe(1);
    expect(parseMessagesPage('0')).toBe(1);
    expect(parseMessagesPage('-3')).toBe(1);
    expect(parseMessagesPage('nope')).toBe(1);
  });

  it('accepts positive integer pages and array search params', () => {
    expect(parseMessagesPage('2')).toBe(2);
    expect(parseMessagesPage('12.9')).toBe(12);
    expect(parseMessagesPage(['4', '9'])).toBe(4);
  });
});
