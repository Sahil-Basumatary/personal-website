import type { FSNode } from '@/types/file-system';
import type { WindowConfig } from '@/types/window';

export interface OutputLine {
  text: string;
  type: 'stdout' | 'error' | 'system' | 'accent';
}

export interface CommandContext {
  cwd: string;
  setCwd: (path: string) => void;
  fs: {
    getNode: (path: string) => FSNode | null;
    listDirectory: (path: string) => FSNode[] | null;
    resolvePath: (cwd: string, relative: string) => string;
    getFileContent: (path: string) => string | null;
  };
  openWindow: (config: WindowConfig) => string;
  history: string[];
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[], ctx: CommandContext) => OutputLine[];
}

function stdout(text: string): OutputLine {
  return { text, type: 'stdout' };
}

function error(text: string): OutputLine {
  return { text, type: 'error' };
}

function system(text: string): OutputLine {
  return { text, type: 'system' };
}

function accent(text: string): OutputLine {
  return { text, type: 'accent' };
}

function nodeIcon(node: FSNode): string {
  switch (node.kind) {
    case 'folder':
      return '📁';
    case 'app':
      return '⚙️';
    case 'alias':
      return '🔗';
    default:
      return '📄';
  }
}

const help: Command = {
  name: 'help',
  description: 'List available commands',
  execute: () => {
    const lines: OutputLine[] = [accent('Available commands:'), stdout('')];
    for (const cmd of Object.values(COMMANDS)) {
      const padded = cmd.name.padEnd(12);
      lines.push(stdout(`  ${padded} ${cmd.description}`));
    }
    lines.push(stdout(''));
    lines.push(system('Use tab for auto-completion.'));
    return lines;
  },
};

const whoami: Command = {
  name: 'whoami',
  description: 'Who is this?',
  execute: () => [
    accent('Sahil Basumatary'),
    stdout("CS @ King's College London"),
  ],
};

const pwd: Command = {
  name: 'pwd',
  description: 'Print working directory',
  execute: (_args, ctx) => [stdout(ctx.cwd)],
};

const echo: Command = {
  name: 'echo',
  description: 'Echo arguments',
  execute: (args) => [stdout(args.join(' '))],
};

const date: Command = {
  name: 'date',
  description: 'Show current date and time',
  execute: () => [stdout(new Date().toString())],
};

const cd: Command = {
  name: 'cd',
  description: 'Change directory',
  execute: (args, ctx) => {
    const target = args[0] ?? '/';
    const resolved = ctx.fs.resolvePath(ctx.cwd, target);
    const node = ctx.fs.getNode(resolved);
    if (!node) return [error(`cd: no such directory: ${target}`)];
    if (node.kind !== 'folder')
      return [error(`cd: not a directory: ${target}`)];
    ctx.setCwd(resolved);
    return [];
  },
};

const ls: Command = {
  name: 'ls',
  description: 'List directory contents',
  execute: (args, ctx) => {
    const target = args[0] ? ctx.fs.resolvePath(ctx.cwd, args[0]) : ctx.cwd;
    const entries = ctx.fs.listDirectory(target);
    if (!entries)
      return [error(`ls: no such directory: ${args[0] ?? ctx.cwd}`)];
    if (entries.length === 0) return [system('(empty)')];
    return entries.map((entry) => {
      const suffix = entry.kind === 'folder' ? '/' : '';
      return stdout(`  ${nodeIcon(entry)}  ${entry.name}${suffix}`);
    });
  },
};

const cat: Command = {
  name: 'cat',
  description: 'Print file contents',
  execute: (args, ctx) => {
    if (args.length === 0) return [error('cat: missing file operand')];
    const resolved = ctx.fs.resolvePath(ctx.cwd, args[0]);
    const node = ctx.fs.getNode(resolved);
    if (!node) return [error(`cat: ${args[0]}: No such file`)];
    if (node.kind === 'folder')
      return [error(`cat: ${args[0]}: Is a directory`)];
    if (node.kind === 'app')
      return [error(`cat: ${args[0]}: Is an application`)];
    const content = ctx.fs.getFileContent(resolved);
    if (content === null) return [error(`cat: ${args[0]}: Cannot read file`)];
    return content.split('\n').map((line) => stdout(line));
  },
};

const clear: Command = {
  name: 'clear',
  description: 'Clear terminal output',
  execute: () => [],
};

export const COMMANDS: Record<string, Command> = {
  help: help,
  whoami: whoami,
  pwd: pwd,
  cd: cd,
  ls: ls,
  cat: cat,
  echo: echo,
  date: date,
  clear: clear,
};

export function getCompletions(input: string, _ctx: CommandContext): string[] {
  const parts = input.split(' ');
  if (parts.length <= 1) {
    const partial = parts[0].toLowerCase();
    return Object.keys(COMMANDS)
      .filter((name) => name.startsWith(partial))
      .sort();
  }
  return [];
}
