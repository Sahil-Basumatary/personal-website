'use client';

import type { BrowserBookmark } from '@/lib/content/bookmarks';

interface BookmarksProps {
  bookmarks: BrowserBookmark[];
  onClick: (bookmark: BrowserBookmark) => void;
}

export function Bookmarks({ bookmarks, onClick }: BookmarksProps) {
  return (
    <div className="browser-bookmarks">
      {bookmarks.map((bm) => (
        <button
          key={bm.url}
          className="browser-bookmark-btn"
          onClick={() => onClick(bm)}
          title={bm.url}
        >
          {bm.label}
        </button>
      ))}
    </div>
  );
}
