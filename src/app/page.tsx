'use client';
import { WindowManager } from '@/components/window';
import { MenuBar, Dock } from '@/components/menubar';
import { Desktop } from '@/components/desktop';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Terminal } from '@/components/apps/terminal/Terminal';
import { FileExplorer } from '@/components/apps/file-explorer/FileExplorer';
import { TextEditor } from '@/components/apps/text-editor/TextEditor';
import { CodePlayground } from '@/components/apps/code-playground/CodePlayground';
import { Browser } from '@/components/apps/browser/Browser';
import { Minesweeper } from '@/components/apps/minesweeper/Minesweeper';
import { EasterEggLayer } from '@/components/easter-eggs';
import { useKonamiCode } from '@/hooks/use-konami-code';

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
  _windowId: string,
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
      return <TextEditor filePath={props?.filePath as string} />;
    case 'code-playground':
      return <CodePlayground />;
    case 'browser':
      return <Browser />;
    case 'minesweeper':
      return <Minesweeper />;
    default:
      return <div style={{ padding: 16, fontSize: 12 }}>{component}</div>;
  }
}

export default function Home() {
  useKeyboardShortcuts();
  useKonamiCode();
  return (
    <div className="os-shell">
      <MenuBar />
      <main className="os-content">
        <Desktop />
        <WindowManager renderContent={renderContent} />
      </main>
      <Dock />
      <EasterEggLayer />
    </div>
  );
}
