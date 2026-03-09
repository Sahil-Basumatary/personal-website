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

const clear: Command = {
  name: 'clear',
  description: 'Clear terminal output',
  execute: () => [],
};

export const COMMANDS: Record<string, Command> = {
  help: help,
  whoami: whoami,
  pwd: pwd,
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
