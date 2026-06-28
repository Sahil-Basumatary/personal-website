// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getCompletions } from './commands';
import { buildCtx } from './commands.fixtures';

describe('getCompletions', () => {
  it('completes command names from a partial', () => {
    const results = getCompletions('co', buildCtx());
    expect(results).toContain('contact');
    expect(results).toContain('cowsay');
    expect(results).toEqual([...results].sort());
  });

  it('completes filesystem paths for path commands', () => {
    const results = getCompletions('ls /Desktop/', buildCtx());
    expect(results).toContain('/Desktop/Projects/');
    expect(results).toContain('/Desktop/notes.txt');
  });

  it('completes apps and projects for open', () => {
    const results = getCompletions('open p', buildCtx());
    expect(results).toContain('pioni');
  });

  it('returns nothing for non-path command arguments', () => {
    expect(getCompletions('whoami arg', buildCtx())).toEqual([]);
  });
});
