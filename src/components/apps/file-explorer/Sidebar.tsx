'use client';

import { useState, useCallback } from 'react';
import { useFileSystemStore } from '@/stores/file-system-store';
import type { FSNode } from '@/types/file-system';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface FolderTreeItemProps {
  node: FSNode;
  path: string;
  currentPath: string;
  depth: number;
  onNavigate: (path: string) => void;
}

function FolderTreeItem({
  node,
  path,
  currentPath,
  depth,
  onNavigate,
}: FolderTreeItemProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const listDirectory = useFileSystemStore((s) => s.listDirectory);
  const isFolder = node.kind === 'folder';
  const isActive = path === currentPath;

  const children = isFolder && expanded ? listDirectory(path) : null;
  const subFolders = children?.filter((c) => c.kind === 'folder') ?? [];

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) setExpanded((prev) => !prev);
    },
    [isFolder]
  );

  const handleClick = useCallback(() => {
    if (isFolder) onNavigate(path);
  }, [isFolder, path, onNavigate]);

  if (!isFolder) return null;

  return (
    <div className="finder-sidebar-item">
      <div
        className={`finder-sidebar-row ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: 4 + depth * 14 }}
        onClick={handleClick}
        role="treeitem"
        aria-expanded={expanded}
        aria-selected={isActive}
      >
        <span
          className={`finder-sidebar-triangle ${expanded ? 'expanded' : ''} ${subFolders.length === 0 ? 'hidden' : ''}`}
          onClick={handleToggle}
        >
          ▸
        </span>
        <span className="finder-sidebar-icon">📁</span>
        <span className="finder-sidebar-label">{node.name}</span>
      </div>
      {expanded && subFolders.length > 0 && (
        <div className="finder-sidebar-children" role="group">
          {subFolders.map((child) => (
            <FolderTreeItem
              key={child.name}
              node={child}
              path={path === '/' ? `/${child.name}` : `${path}/${child.name}`}
              currentPath={currentPath}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const root = useFileSystemStore((s) => s.root);

  return (
    <div className="finder-sidebar" role="tree">
      <FolderTreeItem
        node={root}
        path="/"
        currentPath={currentPath}
        depth={0}
        onNavigate={onNavigate}
      />
    </div>
  );
}
