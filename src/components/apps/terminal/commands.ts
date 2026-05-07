import type { FSNode } from '@/types/file-system';
import type { WindowConfig } from '@/types/window';
import type { EasterEggOverlay } from '@/lib/easter-eggs';
import { buildCowsay, FORTUNES, pickRandom } from '@/lib/easter-eggs';

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
  triggerOverlay: (overlay: EasterEggOverlay) => void;
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

const skills: Command = {
  name: 'skills',
  description: 'Display technical skills',
  execute: (_args, ctx) => {
    const content = ctx.fs.getFileContent('/Desktop/Skills.json');
    if (!content) return [error('skills: could not load Skills.json')];
    try {
      const data = JSON.parse(content) as Record<string, string[]>;
      const lines: OutputLine[] = [accent('Technical Skills'), stdout('')];
      for (const [category, items] of Object.entries(data)) {
        const label = category.charAt(0).toUpperCase() + category.slice(1);
        lines.push(stdout(`  ${label.padEnd(14)} ${items.join(', ')}`));
      }
      return lines;
    } catch {
      return [error('skills: failed to parse Skills.json')];
    }
  },
};

const projects: Command = {
  name: 'projects',
  description: 'List projects',
  execute: (_args, ctx) => {
    const entries = ctx.fs.listDirectory('/Desktop/Projects');
    if (!entries) return [error('projects: could not read Projects directory')];
    const lines: OutputLine[] = [
      accent('Projects'),
      stdout(''),
      stdout(`  ${'Name'.padEnd(20)} ${'Tech'.padEnd(30)} Status`),
      stdout(`  ${'─'.repeat(20)} ${'─'.repeat(30)} ${'─'.repeat(12)}`),
    ];
    for (const entry of entries) {
      if (entry.kind !== 'file') continue;
      const content = ctx.fs.getFileContent(`/Desktop/Projects/${entry.name}`);
      if (!content) continue;
      const contentLines = content.split('\n').filter(Boolean);
      const name = (contentLines[0] ?? entry.name).replace(/^#\s*/, '');
      const techLine = contentLines.find(
        (l) => l.includes(',') || l.includes('React') || l.includes('Python')
      );
      const statusLine = contentLines.find(
        (l) =>
          l.toLowerCase().includes('progress') ||
          l.toLowerCase().includes('live') ||
          l.includes('.com')
      );
      const tech = techLine ?? '—';
      let status = 'LIVE';
      if (statusLine?.toLowerCase().includes('progress')) status = 'WIP';
      lines.push(stdout(`  ${name.padEnd(20)} ${tech.padEnd(30)} ${status}`));
    }
    return lines;
  },
};

const contact: Command = {
  name: 'contact',
  description: 'Show contact info',
  execute: (_args, ctx) => {
    const content = ctx.fs.getFileContent('/Desktop/Contact');
    if (!content) return [error('contact: could not load Contact file')];
    const lines: OutputLine[] = [accent('Contact'), stdout('')];
    for (const line of content.split('\n')) {
      lines.push(stdout(`  ${line}`));
    }
    return lines;
  },
};

const open: Command = {
  name: 'open',
  description: 'Open an app or project',
  execute: (args, ctx) => {
    if (args.length === 0) return [error('open: missing argument')];
    const name = args.join(' ');
    const appEntries = ctx.fs.listDirectory('/Applications');
    if (appEntries) {
      const match = appEntries.find(
        (e) => e.kind === 'app' && e.name.toLowerCase() === name.toLowerCase()
      );
      if (match && match.kind === 'app') {
        ctx.openWindow({
          title: match.name,
          component: match.component,
          size: { width: 600, height: 400 },
        });
        return [system(`Opened ${match.name}`)];
      }
    }
    const projectEntries = ctx.fs.listDirectory('/Desktop/Projects');
    if (projectEntries) {
      const match = projectEntries.find((e) => {
        const baseName = e.name.replace(/\.md$/, '');
        return baseName.toLowerCase() === name.toLowerCase();
      });
      if (match && match.kind === 'file') {
        ctx.openWindow({
          title: match.name,
          component: 'text-editor',
          size: { width: 560, height: 420 },
          props: { filePath: `/Desktop/Projects/${match.name}` },
        });
        return [system(`Opened project: ${match.name.replace(/\.md$/, '')}`)];
      }
    }
    return [
      error(`open: '${name}' not found. Try 'ls /Applications' or 'projects'`),
    ];
  },
};

const history: Command = {
  name: 'history',
  description: 'Show command history',
  execute: (_args, ctx) => {
    if (ctx.history.length === 0) return [system('No history yet.')];
    return ctx.history.map((entry, i) => {
      const num = String(i + 1).padStart(4);
      return stdout(`${num}  ${entry}`);
    });
  },
};

const vim: Command = {
  name: 'vim',
  description: 'Open vim editor',
  execute: () => [
    error("This isn't that kind of terminal..."),
    system('Try the Text Editor app instead: open Text Editor'),
  ],
};

const sudo: Command = {
  name: 'sudo',
  description: 'Execute as superuser',
  execute: (args) => {
    const joined = args.join(' ');
    if (
      joined.includes('rm') &&
      joined.includes('-rf') &&
      joined.includes('/')
    ) {
      return [
        system('Deleting system files...'),
        stdout('  rm: /Applications/Terminal'),
        stdout('  rm: /Desktop/About Me'),
        stdout('  rm: /Desktop/Projects/'),
        stdout('  rm: /Desktop/Skills.json'),
        error('Just kidding. This is a portfolio, not a real OS.'),
        system('Everything is fine. Breathe.'),
      ];
    }
    return [error('Nice try. 🔒')];
  },
};

const nano: Command = {
  name: 'nano',
  description: 'Open nano editor',
  execute: () => [
    error('Nano? In this economy?'),
    system('Try the Text Editor app instead: open Text Editor'),
  ],
};

const neofetch: Command = {
  name: 'neofetch',
  description: 'System info',
  execute: () => [
    accent('         .://:.         sahil@macintosh-hd'),
    accent('       .////////.       ------------------'),
    accent('      ////////////      OS:     SahilOS v1.0'),
    accent('     //////////////     Host:   sahilbzy.com'),
    accent('    ////////////////    Kernel: Next.js 15'),
    accent('   //////////////////   Shell:  Terminal.tsx'),
    accent('    ////////////////    Theme:  Mac OS 9 Platinum'),
    accent('     //////////////     Icons:  SVG handcrafted'),
    accent('      ////////////      CPU:    React 19'),
    accent('       .////////.       Memory: Zustand stores'),
    accent('         .://:.         Uptime: since 2025'),
  ],
};

const clear: Command = {
  name: 'clear',
  description: 'Clear terminal output',
  execute: () => [],
};

const matrix: Command = {
  name: 'matrix',
  description: 'Wake up, Neo...',
  execute: (_args, ctx) => {
    ctx.triggerOverlay('matrix');
    return [accent('Wake up, Neo...'), system('(press ESC or click to exit)')];
  },
};

const cowsay: Command = {
  name: 'cowsay',
  description: 'Make a cow say something',
  execute: (args) => {
    const message = args.join(' ');
    return buildCowsay(message).map((line) => stdout(line));
  },
};

const fortune: Command = {
  name: 'fortune',
  description: 'Print a random fortune',
  execute: () => [stdout(pickRandom(FORTUNES))],
};

const crash: Command = {
  name: 'crash',
  description: 'Trigger a kernel panic',
  execute: (_args, ctx) => {
    ctx.triggerOverlay('sad-mac');
    return [
      error('FATAL: kernel panic - not syncing'),
      system('Press any key to recover.'),
    ];
  },
};

export const COMMANDS: Record<string, Command> = {
  help: help,
  whoami: whoami,
  pwd: pwd,
  cd: cd,
  ls: ls,
  cat: cat,
  skills: skills,
  projects: projects,
  contact: contact,
  open: open,
  history: history,
  echo: echo,
  date: date,
  clear: clear,
  vim: vim,
  nano: nano,
  sudo: sudo,
  neofetch: neofetch,
  matrix: matrix,
  cowsay: cowsay,
  fortune: fortune,
  crash: crash,
};

export function getCompletions(input: string, ctx: CommandContext): string[] {
  const parts = input.split(' ');
  if (parts.length <= 1) {
    const partial = parts[0].toLowerCase();
    return Object.keys(COMMANDS)
      .filter((name) => name.startsWith(partial))
      .sort();
  }
  const cmd = parts[0];
  const pathCommands = ['cd', 'ls', 'cat', 'open'];
  if (!pathCommands.includes(cmd)) return [];
  const partial = parts[parts.length - 1];
  if (cmd === 'open') {
    return getOpenCompletions(partial, ctx);
  }
  return getPathCompletions(partial, ctx);
}

function getOpenCompletions(partial: string, ctx: CommandContext): string[] {
  const results: string[] = [];
  const lower = partial.toLowerCase();
  const apps = ctx.fs.listDirectory('/Applications');
  if (apps) {
    for (const entry of apps) {
      if (entry.name.toLowerCase().startsWith(lower)) {
        results.push(entry.name);
      }
    }
  }
  const projectEntries = ctx.fs.listDirectory('/Desktop/Projects');
  if (projectEntries) {
    for (const entry of projectEntries) {
      const baseName = entry.name.replace(/\.md$/, '');
      if (baseName.toLowerCase().startsWith(lower)) {
        results.push(baseName);
      }
    }
  }
  return results.sort();
}

function getPathCompletions(partial: string, ctx: CommandContext): string[] {
  let dir: string;
  let prefix: string;
  let nameStart: string;
  const lastSlash = partial.lastIndexOf('/');
  if (lastSlash === -1) {
    dir = ctx.cwd;
    prefix = '';
    nameStart = partial;
  } else {
    const dirPart = partial.slice(0, lastSlash) || '/';
    dir = ctx.fs.resolvePath(ctx.cwd, dirPart);
    prefix = partial.slice(0, lastSlash + 1);
    nameStart = partial.slice(lastSlash + 1);
  }
  const entries = ctx.fs.listDirectory(dir);
  if (!entries) return [];
  const lower = nameStart.toLowerCase();
  return entries
    .filter((e) => e.name.toLowerCase().startsWith(lower))
    .map((e) => {
      const suffix = e.kind === 'folder' ? '/' : '';
      return prefix + e.name + suffix;
    })
    .sort();
}
