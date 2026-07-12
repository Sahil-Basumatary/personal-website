'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { BeforeMount, OnMount, Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { OutputPanel, type OutputLine } from './OutputPanel';
import { DEFAULT_CODE, SNIPPETS, type Language } from './snippets';
import { PlatinumLoading } from '@/components/ui';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="playground">
      <PlatinumLoading label="Loading editor…" />
    </div>
  ),
});

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
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  fontSize: 12,
  fontFamily: "'Geneva', 'Monaco', 'Courier New', monospace",
  renderLineHighlight: 'line' as const,
  lineNumbers: 'on' as const,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { verticalScrollbarSize: 12, horizontalScrollbarSize: 12 },
  padding: { top: 8 },
  contextmenu: false,
  folding: true,
  glyphMargin: false,
  tabSize: 2,
};

interface PyodideRuntime {
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
}

interface WindowWithPyodide {
  loadPyodide?: () => Promise<PyodideRuntime>;
}

// Pyodide singleton — shared across playground instances
let pyodideInstance: PyodideRuntime | null = null;
let pyodideLoadPromise: Promise<PyodideRuntime> | null = null;

function loadPyodideRuntime(): Promise<PyodideRuntime> {
  if (pyodideInstance) return Promise.resolve(pyodideInstance);
  if (pyodideLoadPromise) return pyodideLoadPromise;
  pyodideLoadPromise = (async () => {
    if (!(window as WindowWithPyodide).loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = () => resolve();
        script.onerror = () => {
          pyodideLoadPromise = null;
          reject(new Error('Failed to load Pyodide'));
        };
        document.head.appendChild(script);
      });
    }
    pyodideInstance = await (window as WindowWithPyodide).loadPyodide!();
    return pyodideInstance!;
  })();
  return pyodideLoadPromise;
}

export function CodePlayground() {
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState<
    'idle' | 'loading' | 'ready'
  >(pyodideInstance ? 'ready' : 'idle');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const runRef = useRef<() => void>(() => {});
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }
    };
  }, []);
  const addOutput = useCallback((line: OutputLine) => {
    setOutput((prev) => [...prev, line]);
  }, []);
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);
  const executeInIframe = useCallback(
    (jsCode: string) => {
      return new Promise<void>((resolve) => {
        if (iframeRef.current) {
          iframeRef.current.remove();
        }
        const iframe = document.createElement('iframe');
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.style.display = 'none';
        const encoded = btoa(unescape(encodeURIComponent(jsCode)));
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener('message', handler);
          clearTimeout(timer);
          resolve();
        };
        const handler = (e: MessageEvent) => {
          if (e.data?.source !== 'playground') return;
          if (e.data.type === 'done') {
            finish();
            return;
          }
          addOutput({ type: e.data.type, text: e.data.data });
        };
        window.addEventListener('message', handler);
        const timer = setTimeout(() => {
          addOutput({ type: 'error', text: 'Execution timed out (10s)' });
          finish();
        }, 10000);
        iframe.srcdoc = [
          '<!DOCTYPE html><html><body><script>',
          "['log','error','warn','info'].forEach(function(m){",
          '  console[m]=function(){',
          '    var a=Array.from(arguments).map(function(v){',
          "      try{return typeof v==='object'?JSON.stringify(v,null,2):String(v)}",
          '      catch(e){return String(v)}',
          '    });',
          "    window.parent.postMessage({source:'playground',type:m,data:a.join(' ')},'*');",
          '  };',
          '});',
          '(async function(){',
          '  try{',
          "    var __c=decodeURIComponent(escape(atob('" + encoded + "')));",
          "    await eval('(async()=>{\\n'+__c+'\\n})()');",
          '  }catch(e){',
          "    window.parent.postMessage({source:'playground',type:'error',data:e.stack||e.message||String(e)},'*');",
          '  }',
          "  window.parent.postMessage({source:'playground',type:'done'},'*');",
          '})();',
          '</script></body></html>',
        ].join('\n');
        document.body.appendChild(iframe);
        iframeRef.current = iframe;
      });
    },
    [addOutput]
  );
  const transpileTS = useCallback(async (): Promise<string> => {
    const monaco = monacoRef.current;
    const ed = editorRef.current;
    if (!monaco || !ed) return ed?.getValue() ?? '';
    const model = ed.getModel();
    if (!model) return ed.getValue();
    try {
      const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
      const client = await getWorker(model.uri);
      const result = await client.getEmitOutput(model.uri.toString());
      if (result.outputFiles.length > 0) {
        return result.outputFiles[0].text;
      }
    } catch {
      // TS worker unavailable — fall through to raw source
    }
    return ed.getValue();
  }, []);
  const executePython = useCallback(
    async (pythonCode: string) => {
      if (!pyodideInstance) {
        setPyodideStatus('loading');
        addOutput({
          type: 'system',
          text: 'Loading Python runtime (Pyodide)… This may take a moment.',
        });
      }
      try {
        const pyodide = await loadPyodideRuntime();
        setPyodideStatus('ready');
        pyodide.setStdout({
          batched: (text: string) => addOutput({ type: 'log', text }),
        });
        pyodide.setStderr({
          batched: (text: string) => addOutput({ type: 'error', text }),
        });
        const result = await pyodide.runPythonAsync(pythonCode);
        if (
          result !== undefined &&
          result !== null &&
          String(result) !== 'None'
        ) {
          addOutput({ type: 'log', text: String(result) });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        addOutput({ type: 'error', text: msg });
      }
    },
    [addOutput]
  );
  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    const currentCode = editorRef.current?.getValue() ?? code;
    addOutput({ type: 'system', text: `▶ Running ${language}…` });
    try {
      if (language === 'javascript') {
        await executeInIframe(currentCode);
      } else if (language === 'typescript') {
        addOutput({ type: 'system', text: 'Transpiling TypeScript…' });
        const jsCode = await transpileTS();
        await executeInIframe(jsCode);
      } else {
        await executePython(currentCode);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Execution failed';
      addOutput({ type: 'error', text: msg });
    }
    setIsRunning(false);
  }, [
    isRunning,
    language,
    code,
    addOutput,
    executeInIframe,
    transpileTS,
    executePython,
  ]);
  useEffect(() => {
    runRef.current = handleRun;
  }, [handleRun]);
  const handleBeforeMount = useCallback<BeforeMount>((monaco) => {
    monacoRef.current = monaco;
    monaco.editor.defineTheme('playground-platinum', PLATINUM_THEME);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      strict: false,
      noEmit: false,
      esModuleInterop: true,
      allowJs: true,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  }, []);
  const handleMount = useCallback<OnMount>((editor) => {
    editorRef.current = editor;
    const monaco = monacoRef.current;
    if (monaco) {
      editor.addAction({
        id: 'run-code',
        label: 'Run Code',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => runRef.current(),
      });
    }
    editor.focus();
  }, []);
  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const lang = e.target.value as Language;
      setLanguage(lang);
      setCode(DEFAULT_CODE[lang]);
    },
    []
  );
  const handleSnippetSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = parseInt(e.target.value, 10);
      if (isNaN(idx)) return;
      const snippet = SNIPPETS[language][idx];
      if (snippet) {
        setCode(snippet.code);
      }
      e.target.value = '';
    },
    [language]
  );
  return (
    <div className="playground">
      <div className="playground-toolbar">
        <select
          className="playground-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
        </select>
        <select
          className="playground-select"
          defaultValue=""
          onChange={handleSnippetSelect}
        >
          <option value="">Examples…</option>
          {SNIPPETS[language].map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="playground-toolbar-spacer" />
        <button
          className="playground-btn"
          onClick={clearOutput}
          disabled={isRunning}
        >
          Clear
        </button>
        <button
          className="playground-btn playground-btn-run"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? 'Running…' : '▶ Run'}
        </button>
      </div>
      <div className="playground-body">
        <div className="playground-editor">
          <MonacoEditor
            value={code}
            language={language}
            theme="playground-platinum"
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            onChange={(v) => setCode(v ?? '')}
            options={EDITOR_OPTIONS}
          />
        </div>
        <div className="playground-divider" />
        <OutputPanel lines={output} pyodideStatus={pyodideStatus} />
      </div>
      <div className="playground-statusbar">
        <span>{language}</span>
        <div className="playground-statusbar-right">
          <span className="playground-statusbar-hint">⌘↵ to run</span>
          {pyodideStatus === 'loading' && <span>Loading Pyodide…</span>}
          {pyodideStatus === 'ready' && (
            <span className="playground-badge">Python Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}
