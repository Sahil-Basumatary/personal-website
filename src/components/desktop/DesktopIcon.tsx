'use client';
import { useCallback, useRef } from 'react';
import type { DesktopIconData } from '@/types/desktop';

interface DesktopIconProps {
  icon: DesktopIconData;
  selected: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onOpen: (icon: DesktopIconData, originEl?: HTMLElement | null) => void;
}

function IconGraphic({ type }: { type: DesktopIconData['iconType'] }) {
  switch (type) {
    case 'disk':
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="desktop-icon-svg"
        >
          <rect
            x="2"
            y="6"
            width="28"
            height="20"
            rx="2"
            fill="#c0c0c0"
            stroke="#333"
            strokeWidth="1"
          />
          <rect
            x="6"
            y="8"
            width="20"
            height="12"
            fill="#efefef"
            stroke="#666"
            strokeWidth="0.5"
          />
          <rect x="18" y="22" width="8" height="2" rx="1" fill="#999" />
        </svg>
      );
    case 'folder':
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="desktop-icon-svg"
        >
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
    case 'file':
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="desktop-icon-svg"
        >
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
    case 'app':
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="desktop-icon-svg"
        >
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
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="desktop-icon-svg"
        >
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
  }
}

export function DesktopIcon({
  icon,
  selected,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  const lastTouchTapRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const originFromRoot = useCallback(() => {
    const root = rootRef.current;
    if (!root) return null;
    return (
      (root.querySelector('.desktop-icon-image') as HTMLElement | null) ?? root
    );
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const additive = e.metaKey || e.ctrlKey;
      onSelect(icon.id, additive);
    },
    [icon.id, onSelect]
  );
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const now = Date.now();
      if (selected && now - lastTouchTapRef.current < 600) {
        onOpen(icon, originFromRoot());
        lastTouchTapRef.current = 0;
        return;
      }
      lastTouchTapRef.current = now;
    },
    [icon, selected, onOpen, originFromRoot]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpen(icon, originFromRoot());
    },
    [icon, onOpen, originFromRoot]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onOpen(icon, originFromRoot());
      }
    },
    [icon, onOpen, originFromRoot]
  );

  return (
    <div
      ref={rootRef}
      className={`desktop-icon ${selected ? 'selected' : ''}`}
      data-help-anchor={icon.id}
      onMouseDown={handleMouseDown}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={icon.label}
      aria-pressed={selected}
    >
      <div className="desktop-icon-image">
        <IconGraphic type={icon.iconType} />
      </div>
      <span className="desktop-icon-label">{icon.label}</span>
    </div>
  );
}
