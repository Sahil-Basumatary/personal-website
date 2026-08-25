// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { COMMANDS } from './commands';
import { buildCtx, NODES, DIRS } from './commands.fixtures';
import type { FSNode } from '@/types/file-system';

describe('basic commands', () => {
  it('whoami returns identity lines', () => {
    const out = COMMANDS.whoami.execute([], buildCtx());
    expect(out[0].text).toContain('Sahil Basumatary');
  });

  it('echo joins its arguments', () => {
    const out = COMMANDS.echo.execute(['hello', 'world'], buildCtx());
    expect(out).toEqual([{ text: 'hello world', type: 'stdout' }]);
  });

  it('pwd prints the current directory', () => {
    const out = COMMANDS.pwd.execute([], buildCtx({ cwd: '/Applications' }));
    expect(out[0].text).toBe('/Applications');
  });

  it('clear returns no output lines', () => {
    expect(COMMANDS.clear.execute([], buildCtx())).toEqual([]);
  });

  it('help lists every registered command', () => {
    const out = COMMANDS.help.execute([], buildCtx());
    const text = out.map((line) => line.text).join('\n');
    for (const name of Object.keys(COMMANDS)) {
      expect(text).toContain(name);
    }
  });
});

describe('cd', () => {
  it('changes into an existing directory', () => {
    const ctx = buildCtx();
    COMMANDS.cd.execute(['/Applications'], ctx);
    expect(ctx.setCwd).toHaveBeenCalledWith('/Applications');
  });

  it('errors on a missing directory', () => {
    const out = COMMANDS.cd.execute(['/nope'], buildCtx());
    expect(out[0].type).toBe('error');
  });

  it('errors when the target is a file', () => {
    const out = COMMANDS.cd.execute(['/Desktop/notes.txt'], buildCtx());
    expect(out[0].type).toBe('error');
    expect(out[0].text).toContain('not a directory');
  });
});

describe('ls', () => {
  it('lists the current directory', () => {
    const out = COMMANDS.ls.execute([], buildCtx({ cwd: '/Desktop' }));
    const text = out.map((l) => l.text).join('\n');
    expect(text).toContain('Projects/');
    expect(text).toContain('notes.txt');
  });

  it('reports an empty directory', () => {
    const out = COMMANDS.ls.execute(['/Desktop/empty'], buildCtx());
    expect(out[0].text).toBe('(empty)');
  });

  it('errors on a missing directory', () => {
    const out = COMMANDS.ls.execute(['/missing'], buildCtx());
    expect(out[0].type).toBe('error');
  });
});

describe('cat', () => {
  it('prints file contents line by line', () => {
    const out = COMMANDS.cat.execute(['/Desktop/notes.txt'], buildCtx());
    expect(out.map((l) => l.text)).toEqual(['line one', 'line two']);
  });

  it('errors with no operand', () => {
    expect(COMMANDS.cat.execute([], buildCtx())[0].type).toBe('error');
  });

  it('errors when target is a directory', () => {
    const out = COMMANDS.cat.execute(['/Desktop/Projects'], buildCtx());
    expect(out[0].text).toContain('Is a directory');
  });

  it('errors when target is an application', () => {
    const out = COMMANDS.cat.execute(['/Applications/Terminal'], buildCtx());
    expect(out[0].text).toContain('Is an application');
  });

  it('errors on a missing file', () => {
    const out = COMMANDS.cat.execute(['/Desktop/ghost'], buildCtx());
    expect(out[0].type).toBe('error');
  });
});

describe('history', () => {
  it('reports when there is no history', () => {
    expect(COMMANDS.history.execute([], buildCtx())[0].text).toBe(
      'No history yet.'
    );
  });

  it('numbers prior commands', () => {
    const out = COMMANDS.history.execute(
      [],
      buildCtx({ history: ['ls', 'whoami'] })
    );
    expect(out).toHaveLength(2);
    expect(out[0].text).toContain('ls');
    expect(out[1].text).toContain('whoami');
  });
});

describe('open', () => {
  it('opens a matching application', () => {
    const ctx = buildCtx();
    const out = COMMANDS.open.execute(['terminal'], ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith(
      expect.objectContaining({ component: 'terminal' })
    );
    expect(out[0].text).toContain('Opened');
  });

  it('opens a matching project in the file explorer', () => {
    const ctx = buildCtx();
    COMMANDS.open.execute(['pioni'], ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        component: 'file-explorer',
        props: { initialPath: '/Desktop/Projects/pioni' },
      })
    );
  });

  it('errors with no argument', () => {
    expect(COMMANDS.open.execute([], buildCtx())[0].type).toBe('error');
  });

  it('errors when nothing matches', () => {
    const out = COMMANDS.open.execute(['nonexistent'], buildCtx());
    expect(out[0].type).toBe('error');
  });
});

describe('skills and projects', () => {
  it('skills parses and lists categories', () => {
    const out = COMMANDS.skills.execute([], buildCtx());
    const text = out.map((l) => l.text).join('\n');
    expect(text).toContain('Languages');
    expect(text).toContain('TypeScript (advanced), Python (intermediate)');
  });

  it('projects lists summary and tech tags and flags malformed metadata', () => {
    const dirs: Record<string, FSNode[]> = {
      ...DIRS,
      '/Desktop/Projects': [
        NODES['/Desktop/Projects/pioni'],
        { name: 'broken', kind: 'folder', children: {} },
      ],
    };
    const ctx = buildCtx();
    ctx.fs.listDirectory = (path) => dirs[path] ?? null;
    const out = COMMANDS.projects.execute([], ctx);
    const text = out.map((l) => l.text).join('\n');
    expect(text).toContain('Pioni');
    expect(text).toContain('Live paper-trading platform');
    expect(text).toContain('TypeScript');
    expect(text).not.toContain('LIVE');
    expect(out.some((l) => l.type === 'error')).toBe(true);
  });
});

describe('easter eggs', () => {
  it('matrix triggers the matrix overlay', () => {
    const ctx = buildCtx();
    COMMANDS.matrix.execute([], ctx);
    expect(ctx.triggerOverlay).toHaveBeenCalledWith('matrix');
  });

  it('crash triggers the sad-mac overlay', () => {
    const ctx = buildCtx();
    COMMANDS.crash.execute([], ctx);
    expect(ctx.triggerOverlay).toHaveBeenCalledWith('sad-mac');
  });

  it('sudo rm -rf / is a harmless joke', () => {
    const out = COMMANDS.sudo.execute(['rm', '-rf', '/'], buildCtx());
    const text = out.map((l) => l.text).join('\n');
    expect(text).toContain('Just kidding');
  });

  it('sudo with other args is denied', () => {
    const out = COMMANDS.sudo.execute(['reboot'], buildCtx());
    expect(out[0].type).toBe('error');
  });

  it('cowsay wraps the message in a speech bubble', () => {
    const out = COMMANDS.cowsay.execute(['moo'], buildCtx());
    expect(out.some((l) => l.text.includes('moo'))).toBe(true);
    expect(out.some((l) => l.text.includes('^__^'))).toBe(true);
  });
});
