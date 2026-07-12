'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { BeforeMount, OnMount } from '@monaco-editor/react';
import { useFileSystemStore, getExtension } from '@/stores/file-system-store';
import { PlatinumLoading } from '@/components/ui';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="text-editor">
      <PlatinumLoading label="Loading editor…" />
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

function extractFileName(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? path;
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
  const fileName = useMemo(
    () => (filePath ? extractFileName(filePath) : null),
    [filePath]
  );

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
      <div className="text-editor">
        <div className="text-editor-empty">
          <p className="text-editor-empty-title">SimpleText</p>
          <p className="text-editor-empty-hint">
            Open a file from Finder to view its contents.
          </p>
        </div>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="text-editor">
        <div className="text-editor-empty">
          <p className="text-editor-empty-title">File Not Found</p>
          <p className="text-editor-empty-hint">{filePath}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-editor">
      <div className="text-editor-body">
        <MonacoEditor
          value={content}
          language={language}
          theme="platinum"
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={EDITOR_OPTIONS}
        />
      </div>
      <div className="text-editor-statusbar">
        <span className="text-editor-statusbar-left">
          {fileName} — Ln {cursor.line}, Col {cursor.col}
        </span>
        <div className="text-editor-statusbar-right">
          <span>{language}</span>
          <span className="text-editor-badge">Read-Only</span>
        </div>
      </div>
    </div>
  );
}
