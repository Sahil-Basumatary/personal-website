'use client';

import { useCallback } from 'react';

interface ToolbarProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onOpenExternal: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  canOpenExternal: boolean;
  isLoading: boolean;
}

export function Toolbar({
  url,
  onUrlChange,
  onSubmit,
  onBack,
  onForward,
  onRefresh,
  onHome,
  onOpenExternal,
  canGoBack,
  canGoForward,
  canOpenExternal,
  isLoading,
}: ToolbarProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit(url);
      }
    },
    [url, onSubmit]
  );

  return (
    <div className="browser-toolbar">
      <div className="browser-nav-group">
        <button
          className="browser-nav-btn"
          onClick={onBack}
          disabled={!canGoBack}
          title="Back"
        >
          ◀
        </button>
        <button
          className="browser-nav-btn"
          onClick={onForward}
          disabled={!canGoForward}
          title="Forward"
        >
          ▶
        </button>
        <button
          className="browser-nav-btn"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
        >
          ↻
        </button>
        <button className="browser-nav-btn" onClick={onHome} title="Home">
          ⌂
        </button>
        <button
          className="browser-nav-btn browser-nav-btn--external"
          onClick={onOpenExternal}
          disabled={!canOpenExternal}
          title="Open Externally"
        >
          Open Externally
        </button>
      </div>
      <input
        className="browser-address"
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a URL…"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
