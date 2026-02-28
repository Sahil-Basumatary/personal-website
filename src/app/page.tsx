'use client';
import { useEffect, useCallback } from 'react';
import { WindowManager } from '@/components/window';
import { useWindowStore } from '@/stores/window-store';

function AboutContent() {
  return (
    <div
      style={{
        padding: 20,
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        Mac OS 9
      </div>
      <div style={{ marginBottom: 4 }}>Personal Website</div>
      <div style={{ color: 'var(--border-shadow)' }}>Version 1.0</div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: '1px solid var(--border-shadow)',
          color: 'var(--border-shadow)',
          fontSize: 11,
        }}
      >
        Built with Next.js, React, and Zustand
      </div>
    </div>
  );
}

function WelcomeContent() {
  return (
    <div
      style={{
        padding: 16,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        Welcome to the Window Manager
      </p>
      <p>Try these interactions:</p>
      <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
        <li>Drag windows by their title bar</li>
        <li>Resize from the bottom-right corner</li>
        <li>Click a window to bring it to front</li>
        <li>Close, zoom, and collapse buttons</li>
      </ul>
      <p style={{ marginTop: 12 }}>Keyboard shortcuts:</p>
      <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
        <li>⌘W — Close active window</li>
        <li>⌘M — Minimize active window</li>
        <li>⌘Tab — Cycle between windows</li>
      </ul>
    </div>
  );
}

function NotepadContent() {
  return (
    <div
      style={{
        padding: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
      }}
    >
      {`The quick brown fox jumps over the lazy dog.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`}
    </div>
  );
}

function renderDemoContent(_windowId: string, component: string) {
  switch (component) {
    case 'about':
      return <AboutContent />;
    case 'welcome':
      return <WelcomeContent />;
    case 'notepad':
      return <NotepadContent />;
    default:
      return (
        <div
          style={{ padding: 16, fontFamily: 'var(--font-body)', fontSize: 12 }}
        >
          {component}
        </div>
      );
  }
}

function MenuBar() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const cascadeWindows = useWindowStore((s) => s.cascadeWindows);
  const tileWindows = useWindowStore((s) => s.tileWindows);
  const handleNewWindow = useCallback(() => {
    const count = Object.keys(useWindowStore.getState().windows).length;
    openWindow({
      title: `Untitled ${count + 1}`,
      component: 'notepad',
    });
  }, [openWindow]);
  return (
    <div className="demo-menubar">
      <button className="demo-menubar-item" onClick={handleNewWindow}>
        New Window
      </button>
      <div className="demo-menubar-divider" />
      <button className="demo-menubar-item" onClick={cascadeWindows}>
        Cascade
      </button>
      <button className="demo-menubar-item" onClick={tileWindows}>
        Tile
      </button>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const state = useWindowStore.getState();
    if (Object.keys(state.windows).length > 0) return;
    state.openWindow({
      title: 'About This Computer',
      component: 'about',
      position: { x: 60, y: 50 },
      size: { width: 340, height: 220 },
    });
    state.openWindow({
      title: 'Welcome',
      component: 'welcome',
      position: { x: 140, y: 90 },
      size: { width: 420, height: 340 },
    });
    state.openWindow({
      title: 'SimpleText',
      component: 'notepad',
      position: { x: 280, y: 160 },
      size: { width: 360, height: 280 },
    });
  }, []);
  return (
    <div className="demo-desktop">
      <MenuBar />
      <WindowManager renderContent={renderDemoContent} />
    </div>
  );
}
