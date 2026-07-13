'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { Bookmarks } from './Bookmarks';
import { BOOKMARKS, type BrowserBookmark } from '@/lib/content/bookmarks';
import { PlatinumLoading } from '@/components/ui';
import { BROWSER_EMBED_TIMEOUT_MS, openExternalUrl } from '@/lib/open-external';

const HOME_URL = 'about:home';

interface NavState {
  entries: string[];
  index: number;
}

type EmbedStatus = 'idle' | 'loading' | 'ready' | 'timed-out';

function normalizeUrl(raw: string): string {
  if (raw === HOME_URL) return raw;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return 'https://' + raw;
}

interface BrowserProps {
  initialUrl?: string;
  embedTimeoutMs?: number;
}

export function Browser({
  initialUrl,
  embedTimeoutMs = BROWSER_EMBED_TIMEOUT_MS,
}: BrowserProps = {}) {
  const seededUrl = initialUrl ? normalizeUrl(initialUrl) : null;
  const [nav, setNav] = useState<NavState>(() =>
    seededUrl
      ? { entries: [HOME_URL, seededUrl], index: 1 }
      : { entries: [HOME_URL], index: 0 }
  );
  const [inputValue, setInputValue] = useState(seededUrl ?? '');
  const [embedStatus, setEmbedStatus] = useState<EmbedStatus>(
    seededUrl ? 'loading' : 'idle'
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadGeneration = useRef(0);

  const currentUrl = nav.entries[nav.index];
  const isHome = currentUrl === HOME_URL;
  const canGoBack = nav.index > 0;
  const canGoForward = nav.index < nav.entries.length - 1;
  const isLoading = embedStatus === 'loading';
  const timedOut = embedStatus === 'timed-out';

  const beginLoad = useCallback(() => {
    loadGeneration.current += 1;
    setEmbedStatus('loading');
  }, []);

  const syncUi = useCallback(
    (url: string) => {
      setInputValue(url === HOME_URL ? '' : url);
      if (url === HOME_URL) {
        loadGeneration.current += 1;
        setEmbedStatus('idle');
        return;
      }
      beginLoad();
    },
    [beginLoad]
  );

  useEffect(() => {
    if (embedStatus !== 'loading' || isHome) return;
    const generation = loadGeneration.current;
    const timer = window.setTimeout(() => {
      if (loadGeneration.current !== generation) return;
      setEmbedStatus('timed-out');
    }, embedTimeoutMs);
    return () => window.clearTimeout(timer);
  }, [embedStatus, isHome, currentUrl, embedTimeoutMs]);

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
    beginLoad();
    const iframe = iframeRef.current;
    if (iframe) {
      const src = iframe.src;
      iframe.src = '';
      requestAnimationFrame(() => {
        iframe.src = src;
      });
    }
  }, [isHome, beginLoad]);

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
    (bm: BrowserBookmark) => navigateTo(bm.url),
    [navigateTo]
  );

  const handleIframeLoad = useCallback(() => {
    setEmbedStatus((status) => (status === 'timed-out' ? status : 'ready'));
  }, []);

  const handleOpenExternal = useCallback(() => {
    if (isHome) return;
    openExternalUrl(currentUrl);
  }, [isHome, currentUrl]);

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
        onOpenExternal={handleOpenExternal}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        canOpenExternal={!isHome}
        isLoading={isLoading}
      />
      <Bookmarks bookmarks={BOOKMARKS} onClick={handleBookmarkClick} />
      <div className="browser-viewport">
        {isHome ? (
          <div className="browser-home">
            <h1 className="browser-home-title">Web Browser</h1>
            <p className="browser-home-subtitle">
              Type a URL or choose a bookmark
            </p>
          </div>
        ) : timedOut ? (
          <div
            className="browser-embed-recovery"
            role="status"
            aria-live="polite"
          >
            <h2 className="browser-embed-recovery__title">
              This page could not be shown here.
            </h2>
            <p className="browser-embed-recovery__copy">
              The site took too long to load in Browser, or it blocks embedding.
              Open it in your system browser, or try loading it again.
            </p>
            <div className="browser-embed-recovery__actions">
              <button
                type="button"
                className="btn primary"
                onClick={handleOpenExternal}
              >
                Open Externally
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={handleRefresh}
              >
                Try Again
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={handleHome}
              >
                Home
              </button>
            </div>
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
          <PlatinumLoading variant="bar" label={`Loading ${currentUrl}…`} />
        )}
      </div>
      <div className="browser-statusbar">
        <span className="browser-statusbar-text">
          {isLoading
            ? `Loading ${currentUrl}…`
            : timedOut
              ? 'Embed unavailable'
              : isHome
                ? 'Home'
                : currentUrl}
        </span>
      </div>
    </div>
  );
}
