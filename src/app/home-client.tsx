'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { WindowManager } from '@/components/window';
import { MenuBar, Dock } from '@/components/menubar';
import { Desktop } from '@/components/desktop';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { EasterEggLayer } from '@/components/easter-eggs';
import { useKonamiCode } from '@/hooks/use-konami-code';
import { useSyncFileSystemRoot } from '@/hooks/use-sync-file-system-root';
import { trackPageView } from '@/lib/analytics/client';
import { writePortfolioCache } from '@/lib/content/portfolio-cache';
import { ConnectivityBanner } from '@/components/desktop/ConnectivityBanner';
import { PlatinumLoading } from '@/components/ui';
import { UnknownApplication } from '@/components/system/UnknownApplication';
import type { FolderNode } from '@/types/file-system';
import type { PortfolioContent } from '@/types/portfolio';

const Terminal = dynamic(
  () =>
    import('@/components/apps/terminal/Terminal').then((mod) => mod.Terminal),
  {
    ssr: false,
    loading: () => <PlatinumLoading label="Opening Terminal…" />,
  }
);
const FileExplorer = dynamic(
  () =>
    import('@/components/apps/file-explorer/FileExplorer').then(
      (mod) => mod.FileExplorer
    ),
  {
    ssr: false,
    loading: () => <PlatinumLoading label="Opening Finder…" />,
  }
);
const TextEditor = dynamic(
  () =>
    import('@/components/apps/text-editor/TextEditor').then(
      (mod) => mod.TextEditor
    ),
  {
    ssr: false,
    loading: () => <PlatinumLoading label="Opening Text Editor…" />,
  }
);
const CodePlayground = dynamic(
  () =>
    import('@/components/apps/code-playground/CodePlayground').then(
      (mod) => mod.CodePlayground
    ),
  {
    ssr: false,
    loading: () => <PlatinumLoading label="Opening Code Playground…" />,
  }
);
const Browser = dynamic(
  () => import('@/components/apps/browser/Browser').then((mod) => mod.Browser),
  {
    ssr: false,
    loading: () => <PlatinumLoading label="Opening Browser…" />,
  }
);
const ContactForm = dynamic(
  () => import('@/components/apps/contact').then((mod) => mod.ContactForm),
  {
    ssr: false,
    loading: () => <PlatinumLoading label="Opening Contact…" />,
  }
);
const Minesweeper = dynamic(
  () =>
    import('@/components/apps/minesweeper/Minesweeper').then(
      (mod) => mod.Minesweeper
    ),
  {
    ssr: false,
    loading: () => <PlatinumLoading label="Opening Minesweeper…" />,
  }
);

function AboutComputerContent() {
  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <div
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        Sahil&apos;s Computer
      </div>
      <div style={{ marginBottom: 4, fontSize: 12 }}>Personal Website v1.0</div>
      <div style={{ color: 'var(--border-shadow)', fontSize: 11 }}>
        Built with Next.js, React &amp; TypeScript
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: '1px solid var(--border-shadow)',
          color: 'var(--border-shadow)',
          fontSize: 11,
        }}
      >
        Sahil Basumatary — King&apos;s College London
      </div>
    </div>
  );
}

function renderContent(
  windowId: string,
  component: string,
  props?: Record<string, unknown>
) {
  switch (component) {
    case 'about-computer':
      return <AboutComputerContent />;
    case 'terminal':
      return <Terminal />;
    case 'file-explorer':
      return <FileExplorer initialPath={props?.initialPath as string} />;
    case 'text-editor':
    case 'notepad':
      return <TextEditor filePath={props?.filePath as string} />;
    case 'code-playground':
      return <CodePlayground />;
    case 'browser':
      return <Browser initialUrl={props?.initialUrl as string | undefined} />;
    case 'contact-form':
      return <ContactForm />;
    case 'minesweeper':
      return <Minesweeper />;
    default:
      return <UnknownApplication windowId={windowId} component={component} />;
  }
}

interface HomeClientProps {
  root: FolderNode;
  content: PortfolioContent;
}

export function HomeClient({ root, content }: HomeClientProps) {
  useSyncFileSystemRoot(root);
  useKeyboardShortcuts();
  useKonamiCode();

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    try {
      writePortfolioCache(window.localStorage, content);
    } catch {
      // Private mode / quota failures should not break the desktop.
    }
  }, [content]);

  return (
    <div className="os-shell">
      <MenuBar />
      <ConnectivityBanner />
      <main className="os-content">
        <Desktop />
        <WindowManager renderContent={renderContent} />
      </main>
      <Dock />
      <EasterEggLayer />
    </div>
  );
}
