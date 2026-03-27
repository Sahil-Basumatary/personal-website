'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { BeforeMount, OnMount } from '@monaco-editor/react';
import { useFileSystemStore, getExtension } from '@/stores/file-system-store';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="text-editor" style={styles.container}>
      <div style={styles.emptyState}>
        <p style={styles.emptyHint}>Loading editor…</p>
      </div>
    </div>
  ),
});

const LANGUAGE_MAP: Record<string, string> = {
  json: 'json',
  md: 'markdown',
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  java: 'java',
  css: 'css',
  html: 'html',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  sh: 'shell',
  bash: 'shell',
};

function detectLanguage(path: string): string {
  return LANGUAGE_MAP[getExtension(path)] ?? 'plaintext';
}

const PLATINUM_THEME = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: '', foreground: '000000', background: 'e8e8e8' },
    { token: 'comment', foreground: '808080', fontStyle: 'italic' },
    { token: 'keyword', foreground: '00007a' },
    { token: 'string', foreground: '7a3e00' },
    { token: 'number', foreground: '336633' },
    { token: 'type', foreground: '5c2699' },
    { token: 'function', foreground: '003366' },
    { token: 'variable', foreground: '1a1a1a' },
    { token: 'constant', foreground: '336633' },
    { token: 'tag', foreground: '00007a' },
    { token: 'attribute.name', foreground: '7a3e00' },
    { token: 'attribute.value', foreground: '336633' },
    { token: 'delimiter', foreground: '444444' },
    { token: 'operator', foreground: '444444' },
  ],
  colors: {
    'editor.background': '#e8e8e8',
    'editor.foreground': '#000000',
    'editor.lineHighlightBackground': '#d4d4d4',
    'editorLineNumber.foreground': '#888888',
    'editorLineNumber.activeForeground': '#444444',
    'editor.selectionBackground': '#3366cc55',
    'editor.inactiveSelectionBackground': '#3366cc33',
    'editorCursor.foreground': '#000000',
    'editorWhitespace.foreground': '#cccccc',
    'editorIndentGuide.background': '#cccccc',
    'editorGutter.background': '#dedede',
    'editorWidget.background': '#e0e0e0',
    'editorWidget.border': '#999999',
    'editorBracketMatch.background': '#c8c8c8',
    'editorBracketMatch.border': '#888888',
  },
};

const EDITOR_OPTIONS = {
  readOnly: true,
  domReadOnly: true,
  lineNumbers: 'on' as const,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  fontSize: 12,
  fontFamily: "'Geneva', 'Monaco', 'Courier New', monospace",
  renderLineHighlight: 'line' as const,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { verticalScrollbarSize: 12, horizontalScrollbarSize: 12 },
  padding: { top: 8 },
  contextmenu: false,
  folding: true,
  glyphMargin: false,
  renderValidationDecorations: 'off' as const,
};

interface TextEditorProps {
  filePath?: string;
}

export function TextEditor({ filePath }: TextEditorProps) {
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const content = useFileSystemStore((s) =>
    filePath ? s.getFileContent(filePath) : null
  );
  const language = filePath ? detectLanguage(filePath) : 'plaintext';

  const handleBeforeMount = useCallback<BeforeMount>((monaco) => {
    monaco.editor.defineTheme('platinum', PLATINUM_THEME);
  }, []);

  const handleMount = useCallback<OnMount>((editor) => {
    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });
    editor.focus();
  }, []);

  if (!filePath) {
    return (
      <div className="text-editor" style={styles.container}>
        <div style={styles.emptyState}>
          <p style={styles.emptyTitle}>SimpleText</p>
          <p style={styles.emptyHint}>
            Open a file from File Explorer to view its contents.
          </p>
        </div>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="text-editor" style={styles.container}>
        <div style={styles.emptyState}>
          <p style={styles.emptyTitle}>File Not Found</p>
          <p style={styles.emptyHint}>{filePath}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-editor" style={styles.container}>
      <div style={styles.editorBody}>
        <MonacoEditor
          value={content}
          language={language}
          theme="platinum"
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={EDITOR_OPTIONS}
        />
      </div>
      <div className="text-editor-statusbar" style={styles.statusBar}>
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <div style={styles.statusBarRight}>
          <span>{language}</span>
          <span style={styles.badge}>Read-Only</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#e8e8e8',
  },
  editorBody: {
    flex: 1,
    minHeight: 0,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'var(--font-system)',
    fontSize: 14,
    margin: 0,
  },
  emptyHint: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: 'var(--border-shadow)',
    margin: 0,
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '3px 8px',
    fontFamily: 'var(--font-body)',
    fontSize: 11,
    borderTop: '1px solid var(--border-shadow)',
    background: 'var(--surface-primary)',
    flexShrink: 0,
  },
  statusBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    padding: '1px 6px',
    fontSize: 10,
    background: 'var(--surface-sunken)',
    color: 'var(--surface-base)',
    borderRadius: 2,
  },
};
