'use client';

import { useState, useRef, useCallback } from 'react';
import { useFileSystemStore } from '@/stores/file-system-store';
import { useWindowStore } from '@/stores/window-store';
import { COMMANDS, getCompletions } from './commands';
import type { OutputLine, CommandContext } from './commands';

const WELCOME_BANNER: OutputLine[] = [
  { text: '  ____        _     _ _', type: 'accent' },
  { text: ' / ___|  __ _| |__ (_) |', type: 'accent' },
  { text: " \\___ \\ / _` | '_ \\| | |", type: 'accent' },
  { text: '  ___) | (_| | | | | | |', type: 'accent' },
  { text: ' |____/ \\__,_|_| |_|_|_|', type: 'accent' },
  { text: '', type: 'stdout' },
  { text: "Welcome. Type 'help' to see available commands.", type: 'system' },
  { text: '', type: 'stdout' },
];

export function useTerminal() {
  const [lines, setLines] = useState<OutputLine[]>(WELCOME_BANNER);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/Desktop');
  const inputRef = useRef<HTMLInputElement>(null);
  const cwdRef = useRef(cwd);
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const tabState = useRef<{
    completions: string[];
    index: number;
    base: string;
  }>({
    completions: [],
    index: -1,
    base: '',
  });
  const getNode = useFileSystemStore((s) => s.getNode);
  const listDirectory = useFileSystemStore((s) => s.listDirectory);
  const resolvePath = useFileSystemStore((s) => s.resolvePath);
  const getFileContent = useFileSystemStore((s) => s.getFileContent);
  const openWindow = useWindowStore((s) => s.openWindow);

  const makeContext = useCallback(
    (): CommandContext => ({
      cwd: cwdRef.current,
      setCwd: (path: string) => {
        setCwd(path);
        cwdRef.current = path;
      },
      fs: { getNode, listDirectory, resolvePath, getFileContent },
      openWindow,
      history: commandHistoryRef.current,
    }),
    [getNode, listDirectory, resolvePath, getFileContent, openWindow]
  );

  const executeCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const currentCwd = cwdRef.current;
      const promptLine: OutputLine = {
        text: `${currentCwd} > ${trimmed}`,
        type: 'system',
      };
      if (!trimmed) {
        setLines((prev) => [...prev, promptLine]);
        return;
      }
      commandHistoryRef.current = [...commandHistoryRef.current, trimmed];
      historyIndexRef.current = -1;
      const [cmdName, ...args] = trimmed.split(/\s+/);
      if (cmdName === 'clear') {
        setLines([]);
        return;
      }
      const command = COMMANDS[cmdName];
      if (!command) {
        setLines((prev) => [
          ...prev,
          promptLine,
          { text: `command not found: ${cmdName}`, type: 'error' },
        ]);
        return;
      }
      const ctx = makeContext();
      const output = command.execute(args, ctx);
      setLines((prev) => [...prev, promptLine, ...output]);
    },
    [makeContext]
  );

  const resetTabState = () => {
    tabState.current = { completions: [], index: -1, base: '' };
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        resetTabState();
        executeCommand(input);
        setInput('');
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        resetTabState();
        const history = commandHistoryRef.current;
        if (history.length === 0) return;
        const idx = historyIndexRef.current;
        const newIndex = idx === -1 ? history.length - 1 : Math.max(0, idx - 1);
        historyIndexRef.current = newIndex;
        setInput(history[newIndex]);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        resetTabState();
        const idx = historyIndexRef.current;
        if (idx === -1) return;
        const history = commandHistoryRef.current;
        const newIndex = idx + 1;
        if (newIndex >= history.length) {
          historyIndexRef.current = -1;
          setInput('');
        } else {
          historyIndexRef.current = newIndex;
          setInput(history[newIndex]);
        }
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const tab = tabState.current;
        if (tab.completions.length > 0 && tab.base === input) {
          tab.index = (tab.index + 1) % tab.completions.length;
        } else {
          const ctx = makeContext();
          const completions = getCompletions(input, ctx);
          if (completions.length === 0) return;
          tab.completions = completions;
          tab.index = 0;
          tab.base = input;
        }
        const parts = input.split(' ');
        if (parts.length <= 1) {
          const completed = tab.completions[tab.index];
          setInput(completed);
          tab.base = completed;
        } else {
          parts[parts.length - 1] = tab.completions[tab.index];
          const completed = parts.join(' ');
          setInput(completed);
          tab.base = completed;
        }
        return;
      }
      resetTabState();
    },
    [input, executeCommand, makeContext]
  );

  return { lines, input, setInput, cwd, handleKeyDown, inputRef };
}
