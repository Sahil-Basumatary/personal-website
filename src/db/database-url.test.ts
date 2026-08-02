// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { DatabaseConfigError, requireDatabaseUrl } from './database-url';

describe('requireDatabaseUrl', () => {
  it('returns a trimmed connection string', () => {
    expect(requireDatabaseUrl('  postgres://example  ')).toBe(
      'postgres://example'
    );
  });

  it('fails closed when the url is missing', () => {
    expect(() => requireDatabaseUrl(undefined)).toThrow(DatabaseConfigError);
    expect(() => requireDatabaseUrl('   ')).toThrow(DatabaseConfigError);
  });
});
