import { create } from 'zustand';
import type { FSNode, FolderNode } from '@/types/file-system';
import { SYSTEM_DRIVE } from '@/lib/content/tree';

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  if (dot <= 0) return '';
  return fileName.slice(dot + 1).toLowerCase();
}

export function resolvePath(cwd: string, relative: string): string {
  const raw = relative.startsWith('/') ? relative : cwd + '/' + relative;
  const segments = raw.split('/');
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      resolved.pop();
    } else {
      resolved.push(seg);
    }
  }
  return '/' + resolved.join('/');
}

function traverseToNode(root: FolderNode, path: string): FSNode | null {
  const normalized = resolvePath('/', path);
  if (normalized === '/') return root;
  const segments = normalized.split('/').filter(Boolean);
  let current: FSNode = root;
  for (const segment of segments) {
    if (current.kind !== 'folder') return null;
    const child: FSNode | undefined = current.children[segment];
    if (!child) return null;
    current = child;
  }
  return current;
}

interface FileSystemState {
  root: FolderNode;
  getNode: (path: string) => FSNode | null;
  listDirectory: (path: string) => FSNode[] | null;
  resolvePath: (cwd: string, relative: string) => string;
  getFileContent: (path: string) => string | null;
}

export const useFileSystemStore = create<FileSystemState>()((_, get) => ({
  root: SYSTEM_DRIVE,
  getNode: (path) => traverseToNode(get().root, path),
  listDirectory: (path) => {
    const node = traverseToNode(get().root, path);
    if (!node || node.kind !== 'folder') return null;
    return Object.values(node.children);
  },
  resolvePath,
  getFileContent: (path) => {
    const node = traverseToNode(get().root, path);
    if (!node || node.kind !== 'file') return null;
    return node.content;
  },
}));
