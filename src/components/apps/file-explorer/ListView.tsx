'use client';

import { useCallback } from 'react';
import type { FSNode } from '@/types/file-system';

interface ListViewProps {
  items: FSNode[];
  selectedItems: Set<string>;
  onSelect: (name: string, additive: boolean) => void;
  onOpen: (node: FSNode) => void;
}

function getKindLabel(node: FSNode): string {
  switch (node.kind) {
    case 'folder':
      return 'Folder';
    case 'app':
      return 'Application';
    case 'alias':
      return 'Alias';
    case 'file': {
      const dot = node.name.lastIndexOf('.');
      if (dot > 0) {
        const ext = node.name.slice(dot + 1).toUpperCase();
        return `${ext} Document`;
      }
      return 'Document';
    }
  }
}

function getSize(node: FSNode): string {
  if (node.kind === 'folder') return '--';
  if (node.kind === 'app') return '--';
  if (node.kind === 'alias') return '--';
  const bytes = new TextEncoder().encode(node.content).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function ListRow({
  node,
  selected,
  onSelect,
  onOpen,
}: {
  node: FSNode;
  selected: boolean;
  onSelect: (name: string, additive: boolean) => void;
  onOpen: (node: FSNode) => void;
}) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(node.name, e.metaKey || e.ctrlKey);
    },
    [node.name, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpen(node);
    },
    [node, onOpen]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onOpen(node);
    },
    [node, onOpen]
  );

  const icon =
    node.kind === 'folder' ? '📁' : node.kind === 'app' ? '💎' : '📄';

  return (
    <div
      className={`finder-list-row ${selected ? 'selected' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      aria-selected={selected}
    >
      <span className="finder-list-cell finder-list-name">
        <span className="finder-list-icon">{icon}</span>
        {node.name}
      </span>
      <span className="finder-list-cell finder-list-kind">
        {getKindLabel(node)}
      </span>
      <span className="finder-list-cell finder-list-size">{getSize(node)}</span>
    </div>
  );
}

export function ListView({
  items,
  selectedItems,
  onSelect,
  onOpen,
}: ListViewProps) {
  const sorted = [...items].sort((a, b) => {
    if (a.kind === 'folder' && b.kind !== 'folder') return -1;
    if (a.kind !== 'folder' && b.kind === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="finder-list" role="grid">
      <div className="finder-list-header" role="row">
        <span className="finder-list-cell finder-list-name" role="columnheader">
          Name
        </span>
        <span className="finder-list-cell finder-list-kind" role="columnheader">
          Kind
        </span>
        <span className="finder-list-cell finder-list-size" role="columnheader">
          Size
        </span>
      </div>
      <div className="finder-list-body">
        {sorted.map((item) => (
          <ListRow
            key={item.name}
            node={item}
            selected={selectedItems.has(item.name)}
            onSelect={onSelect}
            onOpen={onOpen}
          />
        ))}
        {sorted.length === 0 && (
          <div className="finder-list-empty">This folder is empty</div>
        )}
      </div>
    </div>
  );
}
