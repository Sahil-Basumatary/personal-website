'use client';

import { useRef } from 'react';
import type { FolderNode } from '@/types/file-system';
import { useFileSystemStore } from '@/stores/file-system-store';

export function useSyncFileSystemRoot(root: FolderNode): void {
  const syncedRoot = useRef<FolderNode | null>(null);
  if (syncedRoot.current !== root) {
    useFileSystemStore.getState().hydrateRoot(root);
    syncedRoot.current = root;
  }
}
