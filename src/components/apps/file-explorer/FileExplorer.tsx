'use client';

import { useState, useCallback } from 'react';
import { useFileSystemStore } from '@/stores/file-system-store';
import { useWindowStore } from '@/stores/window-store';
import type { FSNode } from '@/types/file-system';
import { openUrl } from '@/lib/open-url';
import { measureOriginRect } from '@/lib/content-rect';
import { openHelpCenter } from '@/stores/help-store';
import { Sidebar } from './Sidebar';
import { ListView } from './ListView';
import { IconView } from './IconView';
import { PathBar } from './PathBar';

type ViewMode = 'list' | 'icon';

interface FileExplorerProps {
  initialPath?: string;
}

export function FileExplorer({ initialPath }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath ?? '/');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [historyBack, setHistoryBack] = useState<string[]>([]);
  const [historyForward, setHistoryForward] = useState<string[]>([]);

  const listDirectory = useFileSystemStore((s) => s.listDirectory);
  const getNode = useFileSystemStore((s) => s.getNode);
  const openWindow = useWindowStore((s) => s.openWindow);

  const items = listDirectory(currentPath);
  const folderMissing = items === null;
  const folderName =
    currentPath === '/'
      ? 'Macintosh HD'
      : (currentPath.split('/').filter(Boolean).at(-1) ?? currentPath);

  const navigateTo = useCallback(
    (path: string) => {
      const node = getNode(path);
      if (!node || node.kind !== 'folder') return;
      setHistoryBack((prev) => [...prev, currentPath]);
      setHistoryForward([]);
      setCurrentPath(path);
      setSelectedItems(new Set());
    },
    [currentPath, getNode]
  );

  const goBack = useCallback(() => {
    if (historyBack.length === 0) return;
    const prev = historyBack[historyBack.length - 1];
    setHistoryBack((s) => s.slice(0, -1));
    setHistoryForward((s) => [...s, currentPath]);
    setCurrentPath(prev);
    setSelectedItems(new Set());
  }, [historyBack, currentPath]);

  const goForward = useCallback(() => {
    if (historyForward.length === 0) return;
    const next = historyForward[historyForward.length - 1];
    setHistoryForward((s) => s.slice(0, -1));
    setHistoryBack((s) => [...s, currentPath]);
    setCurrentPath(next);
    setSelectedItems(new Set());
  }, [historyForward, currentPath]);

  const handleSelect = useCallback((name: string, additive: boolean) => {
    setSelectedItems((prev) => {
      if (additive) {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      }
      return new Set([name]);
    });
  }, []);

  const handleOpen = useCallback(
    (node: FSNode, originEl?: HTMLElement | null) => {
      const nodePath =
        currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`;
      const originRect = measureOriginRect(originEl ?? null);

      switch (node.kind) {
        case 'folder':
          navigateTo(nodePath);
          break;
        case 'app':
          if (node.component === 'help') {
            openHelpCenter();
            break;
          }
          openWindow({
            title: node.name,
            component: node.component,
            size: { width: 600, height: 400 },
            originRect,
          });
          break;
        case 'alias': {
          if (/^https?:\/\//i.test(node.target)) {
            openUrl(node.target);
            break;
          }
          const target = getNode(node.target);
          if (target?.kind === 'folder') navigateTo(node.target);
          else if (target?.kind === 'app') {
            if (target.component === 'help') {
              openHelpCenter();
            } else {
              openWindow({
                title: target.name,
                component: target.component,
                originRect,
              });
            }
          } else
            openWindow({
              title: node.name,
              component: 'text-editor',
              size: { width: 500, height: 350 },
              props: { filePath: node.target },
              originRect,
            });
          break;
        }
        case 'file':
          openWindow({
            title: node.name,
            component: 'text-editor',
            size: { width: 500, height: 350 },
            props: { filePath: nodePath },
            originRect,
          });
          break;
      }
    },
    [currentPath, navigateTo, openWindow, getNode]
  );

  const handleContentBgClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedItems(new Set());
  }, []);

  return (
    <div className="finder">
      <div className="finder-toolbar">
        <div className="finder-toolbar-nav">
          <button
            className="btn finder-toolbar-btn"
            onClick={goBack}
            disabled={historyBack.length === 0}
            title="Back"
          >
            ◀
          </button>
          <button
            className="btn finder-toolbar-btn"
            onClick={goForward}
            disabled={historyForward.length === 0}
            title="Forward"
          >
            ▶
          </button>
        </div>
        <PathBar currentPath={currentPath} onNavigate={navigateTo} />
        <div className="finder-toolbar-views">
          <button
            className={`btn finder-toolbar-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
          <button
            className={`btn finder-toolbar-btn ${viewMode === 'icon' ? 'active' : ''}`}
            onClick={() => setViewMode('icon')}
            title="Icon view"
          >
            ⊞
          </button>
        </div>
      </div>
      <div className="finder-body">
        <Sidebar currentPath={currentPath} onNavigate={navigateTo} />
        <div className="finder-content" onClick={handleContentBgClick}>
          {folderMissing ? (
            <div className="finder-missing" role="status" aria-live="polite">
              <p className="finder-missing__title">
                The folder &ldquo;{folderName}&rdquo; could not be found.
              </p>
              <p className="finder-missing__hint">
                It may have been moved, renamed, or thrown away. Open Macintosh
                HD to continue.
              </p>
              <button
                type="button"
                className="btn primary"
                onClick={() => navigateTo('/')}
              >
                Open Macintosh HD
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <ListView
              items={items}
              selectedItems={selectedItems}
              onSelect={handleSelect}
              onOpen={handleOpen}
            />
          ) : (
            <IconView
              items={items}
              selectedItems={selectedItems}
              onSelect={handleSelect}
              onOpen={handleOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
}
