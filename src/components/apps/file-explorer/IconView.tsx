'use client';

import { useCallback } from 'react';
import type { FSNode } from '@/types/file-system';

interface IconViewProps {
  items: FSNode[];
  selectedItems: Set<string>;
  onSelect: (name: string, additive: boolean) => void;
  onOpen: (node: FSNode) => void;
}

function ItemIcon({ kind }: { kind: FSNode['kind'] }) {
  switch (kind) {
    case 'folder':
      return (
        <svg width="32" height="32" viewBox="0 0 32 32">
          <path
            d="M2 8h10l2-3h16v21H2V8z"
            fill="#f9d71c"
            stroke="#b8960c"
            strokeWidth="0.8"
          />
          <rect
            x="2"
            y="10"
            width="28"
            height="16"
            rx="1"
            fill="#ffeb3b"
            stroke="#b8960c"
            strokeWidth="0.8"
          />
        </svg>
      );
    case 'app':
      return (
        <svg width="32" height="32" viewBox="0 0 32 32">
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="4"
            fill="#3366cc"
            stroke="#1a3366"
            strokeWidth="0.8"
          />
          <rect
            x="6"
            y="8"
            width="20"
            height="16"
            rx="1"
            fill="#ffffff"
            stroke="#1a3366"
            strokeWidth="0.5"
          />
          <rect x="6" y="5" width="20" height="4" rx="1" fill="#4477dd" />
        </svg>
      );
    case 'alias':
      return (
        <svg width="32" height="32" viewBox="0 0 32 32">
          <path
            d="M6 2h14l6 6v22H6V2z"
            fill="#ffffff"
            stroke="#333"
            strokeWidth="0.8"
          />
          <path d="M20 2v6h6" fill="#ddd" stroke="#333" strokeWidth="0.8" />
          <path
            d="M10 20l6-8 6 8"
            fill="none"
            stroke="#3366cc"
            strokeWidth="1.5"
          />
        </svg>
      );
    default:
      return (
        <svg width="32" height="32" viewBox="0 0 32 32">
          <path
            d="M6 2h14l6 6v22H6V2z"
            fill="#ffffff"
            stroke="#333"
            strokeWidth="0.8"
          />
          <path d="M20 2v6h6" fill="#ddd" stroke="#333" strokeWidth="0.8" />
          <line
            x1="10"
            y1="14"
            x2="22"
            y2="14"
            stroke="#999"
            strokeWidth="0.6"
          />
          <line
            x1="10"
            y1="18"
            x2="22"
            y2="18"
            stroke="#999"
            strokeWidth="0.6"
          />
          <line
            x1="10"
            y1="22"
            x2="18"
            y2="22"
            stroke="#999"
            strokeWidth="0.6"
          />
        </svg>
      );
  }
}

function GridItem({
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

  return (
    <div
      className={`finder-grid-item ${selected ? 'selected' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      aria-label={node.name}
      aria-selected={selected}
    >
      <div className="finder-grid-icon">
        <ItemIcon kind={node.kind} />
      </div>
      <span className="finder-grid-label">{node.name}</span>
    </div>
  );
}

export function IconView({
  items,
  selectedItems,
  onSelect,
  onOpen,
}: IconViewProps) {
  const sorted = [...items].sort((a, b) => {
    if (a.kind === 'folder' && b.kind !== 'folder') return -1;
    if (a.kind !== 'folder' && b.kind === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="finder-grid">
      {sorted.map((item) => (
        <GridItem
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
  );
}
