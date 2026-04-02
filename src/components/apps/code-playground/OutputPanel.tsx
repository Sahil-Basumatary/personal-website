'use client';

import { useEffect, useRef } from 'react';

export interface OutputLine {
  type: 'log' | 'error' | 'warn' | 'info' | 'system';
  text: string;
}

interface OutputPanelProps {
  lines: OutputLine[];
  pyodideStatus: 'idle' | 'loading' | 'ready';
}

export function OutputPanel({ lines, pyodideStatus }: OutputPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);
  return (
    <div className="playground-output">
      <div className="playground-output-header">Console Output</div>
      <div className="playground-output-body">
        {lines.length === 0 && pyodideStatus !== 'loading' && (
          <div className="playground-output-empty">
            Click ▶ Run to execute your code.
          </div>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className={`playground-output-line playground-output-${line.type}`}
          >
            {line.text}
          </div>
        ))}
        {pyodideStatus === 'loading' && lines.length === 0 && (
          <div className="playground-output-loading">
            <span className="playground-spinner" />
            Initializing Python runtime…
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
