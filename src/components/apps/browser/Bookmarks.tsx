'use client';

export interface Bookmark {
  label: string;
  url: string;
}

interface BookmarksProps {
  bookmarks: Bookmark[];
  onClick: (bookmark: Bookmark) => void;
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
