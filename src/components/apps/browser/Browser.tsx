'use client';

import { useState, useCallback, useRef } from 'react';
import { Toolbar } from './Toolbar';
import { Bookmarks, type Bookmark } from './Bookmarks';

const HOME_URL = 'about:home';

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { label: 'Blog', url: 'https://blog.sahilbzy.com' },
  { label: 'Pioni', url: 'https://pioni.onrender.com' },
  { label: 'GitHub', url: 'https://github.com/Sahil-Basumatary' },
];

interface NavState {
  entries: string[];
  index: number;
}

function normalizeUrl(raw: string): string {
  if (raw === HOME_URL) return raw;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return 'https://' + raw;
}

export function Browser() {
  const [nav, setNav] = useState<NavState>({
    entries: [HOME_URL],
    index: 0,
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = nav.entries[nav.index];
  const isHome = currentUrl === HOME_URL;
  const canGoBack = nav.index > 0;
  const canGoForward = nav.index < nav.entries.length - 1;

  const syncUi = useCallback((url: string) => {
    setInputValue(url === HOME_URL ? '' : url);
    setIsLoading(url !== HOME_URL);
  }, []);

  const navigateTo = useCallback(
    (raw: string) => {
      const target = normalizeUrl(raw);
      setNav((prev) => ({
        entries: [...prev.entries.slice(0, prev.index + 1), target],
        index: prev.index + 1,
      }));
      syncUi(target);
    },
    [syncUi]
  );

  const handleBack = useCallback(() => {
    let target = '';
    setNav((prev) => {
      if (prev.index <= 0) return prev;
      const newIndex = prev.index - 1;
      target = prev.entries[newIndex];
      return { ...prev, index: newIndex };
    });
    if (target) syncUi(target);
  }, [syncUi]);

  const handleForward = useCallback(() => {
    let target = '';
    setNav((prev) => {
      if (prev.index >= prev.entries.length - 1) return prev;
      const newIndex = prev.index + 1;
      target = prev.entries[newIndex];
      return { ...prev, index: newIndex };
    });
    if (target) syncUi(target);
  }, [syncUi]);

  const handleRefresh = useCallback(() => {
    if (isHome) return;
    setIsLoading(true);
    const iframe = iframeRef.current;
    if (iframe) {
      const src = iframe.src;
      iframe.src = '';
      requestAnimationFrame(() => {
        iframe.src = src;
      });
    }
  }, [isHome]);

  const handleHome = useCallback(() => {
    navigateTo(HOME_URL);
  }, [navigateTo]);

  const handleSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      navigateTo(trimmed);
    },
    [navigateTo]
  );

  const handleBookmarkClick = useCallback(
    (bm: Bookmark) => navigateTo(bm.url),
    [navigateTo]
  );

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="browser">
      <Toolbar
        url={isHome ? '' : inputValue}
        onUrlChange={setInputValue}
        onSubmit={handleSubmit}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onHome={handleHome}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
      />
      <Bookmarks bookmarks={DEFAULT_BOOKMARKS} onClick={handleBookmarkClick} />
      <div className="browser-viewport">
        {isHome ? (
          <div className="browser-home">
            <h1 className="browser-home-title">Web Browser</h1>
            <p className="browser-home-subtitle">
              Type a URL or choose a bookmark
            </p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="browser-iframe"
            src={currentUrl}
            title="Browser"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
            onLoad={handleIframeLoad}
            onError={handleIframeLoad}
          />
        )}
        {isLoading && (
          <div className="browser-loading">
            <div className="browser-loading-bar" />
          </div>
        )}
      </div>
      <div className="browser-statusbar">
        <span className="browser-statusbar-text">
          {isLoading ? `Loading ${currentUrl}…` : isHome ? 'Home' : currentUrl}
        </span>
      </div>
    </div>
  );
}
