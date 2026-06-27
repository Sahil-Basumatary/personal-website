// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { validateContact, FIELD_LIMITS } from './contact-validation';

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Sahil Basumatary',
    email: 'sahil@example.com',
    subject: 'Hello',
    message: 'This is a test message.',
    ...overrides,
  };
}

describe('validateContact', () => {
  it('accepts a well-formed submission', () => {
    const result = validateContact(validInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe('sahil@example.com');
      expect(result.data.name).toBe('Sahil Basumatary');
    }
  });

  it('rejects non-object input', () => {
    expect(validateContact(null).ok).toBe(false);
    expect(validateContact('string').ok).toBe(false);
    expect(validateContact(42).ok).toBe(false);
  });

  it('trims surrounding whitespace before validating', () => {
    const result = validateContact(validInput({ name: '  Sahil  ' }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).toBe('Sahil');
  });

  it('lowercases the email', () => {
    const result = validateContact(validInput({ email: 'Sahil@Example.COM' }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.email).toBe('sahil@example.com');
  });

  it.each([
    ['name', { name: '' }],
    ['email', { email: '' }],
    ['subject', { subject: '' }],
    ['message', { message: '' }],
  ])('requires %s to be present', (_field, overrides) => {
    expect(validateContact(validInput(overrides)).ok).toBe(false);
  });

  it.each([
    'no-at-symbol',
    'two@@at.com',
    'trailing.dot.@example.com',
    '.leading@example.com',
    'spaces in@example.com',
    'double..dot@example.com',
    'missing@tld',
  ])('rejects invalid email "%s"', (email) => {
    expect(validateContact(validInput({ email })).ok).toBe(false);
  });

  it('enforces the name length limit', () => {
    const tooLong = 'a'.repeat(FIELD_LIMITS.name + 1);
    expect(validateContact(validInput({ name: tooLong })).ok).toBe(false);
  });

  it('enforces the message length limit', () => {
    const tooLong = 'a'.repeat(FIELD_LIMITS.message + 1);
    expect(validateContact(validInput({ message: tooLong })).ok).toBe(false);
  });

  it('normalizes unicode spaces to regular spaces', () => {
    const result = validateContact(validInput({ subject: 'a\u00A0b' }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.subject).toBe('a b');
  });

  it('ignores non-string fields by treating them as empty', () => {
    const result = validateContact(validInput({ name: 123 }));
    expect(result.ok).toBe(false);
  });
});
