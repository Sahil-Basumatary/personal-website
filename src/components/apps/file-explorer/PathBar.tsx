'use client';

interface PathBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function PathBar({ currentPath, onNavigate }: PathBarProps) {
  const segments = currentPath === '/' ? [''] : currentPath.split('/');

  const breadcrumbs: { label: string; path: string }[] = [
    { label: 'Macintosh HD', path: '/' },
  ];

  for (let i = 1; i < segments.length; i++) {
    const path = '/' + segments.slice(1, i + 1).join('/');
    breadcrumbs.push({ label: segments[i], path });
  }

  return (
    <div className="finder-pathbar">
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.path} className="finder-pathbar-segment">
          {i > 0 && <span className="finder-pathbar-separator">▸</span>}
          <button
            className="finder-pathbar-btn"
            onClick={() => onNavigate(crumb.path)}
            disabled={crumb.path === currentPath}
          >
            {crumb.label}
          </button>
        </span>
      ))}
    </div>
  );
}
