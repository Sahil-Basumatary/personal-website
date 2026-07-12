// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import {
  useFileSystemStore,
  resolvePath,
  getExtension,
} from './file-system-store';
import { SYSTEM_DRIVE } from '@/lib/content/tree';
import type { FileNode } from '@/types/file-system';

beforeEach(() => {
  useFileSystemStore.setState({ root: SYSTEM_DRIVE });
});

describe('getExtension', () => {
  it.each([
    ['notes.txt', 'txt'],
    ['archive.tar.gz', 'gz'],
    ['README.MD', 'md'],
    ['noextension', ''],
    ['.bashrc', ''],
  ])('reads the extension of %s as "%s"', (name, expected) => {
    expect(getExtension(name)).toBe(expected);
  });
});

describe('resolvePath', () => {
  it.each([
    ['/', 'Desktop', '/Desktop'],
    ['/Desktop', './Projects', '/Desktop/Projects'],
    ['/Desktop', '..', '/'],
    ['/a/b', '/c', '/c'],
    ['/a/b/c', '../../x', '/a/x'],
  ])('resolves (%s, %s) to %s', (cwd, relative, expected) => {
    expect(resolvePath(cwd, relative)).toBe(expected);
  });
});

describe('file system store', () => {
  it('returns nodes and null for missing paths', () => {
    const { getNode } = useFileSystemStore.getState();
    expect(getNode('/Desktop')?.kind).toBe('folder');
    expect(getNode('/does/not/exist')).toBeNull();
  });

  it('lists directories but refuses files', () => {
    const { listDirectory } = useFileSystemStore.getState();
    expect(Array.isArray(listDirectory('/Applications'))).toBe(true);
    expect(listDirectory('/README.md')).toBeNull();
  });

  it('reads file content but not folder content', () => {
    const { getFileContent } = useFileSystemStore.getState();
    expect(typeof getFileContent('/README.md')).toBe('string');
    expect(getFileContent('/Desktop')).toBeNull();
  });

  it('hydrates the root filesystem without cloning', () => {
    const nextRoot = structuredClone(SYSTEM_DRIVE) as typeof SYSTEM_DRIVE;
    useFileSystemStore.getState().hydrateRoot(nextRoot);
    expect(useFileSystemStore.getState().root).toBe(nextRoot);
  });

  it('replaces folder children immutably', () => {
    const note: FileNode = { name: 'note.txt', kind: 'file', content: 'hi' };
    const ok = useFileSystemStore
      .getState()
      .setFolderChildren('/Trash', [note]);
    expect(ok).toBe(true);
    expect(
      useFileSystemStore.getState().getFileContent('/Trash/note.txt')
    ).toBe('hi');
    expect(SYSTEM_DRIVE.children['Trash']).toBeDefined();
  });

  it('rejects setting children on a non-folder', () => {
    expect(
      useFileSystemStore.getState().setFolderChildren('/README.md', [])
    ).toBe(false);
  });
});
