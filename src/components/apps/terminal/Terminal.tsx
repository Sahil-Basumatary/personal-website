'use client';

import { useEffect, useRef } from 'react';
import { useTerminal } from './use-terminal';

export function Terminal() {
  const { lines, input, setInput, cwd, handleKeyDown, inputRef } =
    useTerminal();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="terminal" onClick={focusInput}>
      <div className="terminal-output">
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line terminal-line-${line.type}`}>
            {line.text || '\u00A0'}
          </div>
        ))}
        <div className="terminal-input-row">
          <span className="terminal-prompt">{cwd} &gt;&nbsp;</span>
          <input
            ref={inputRef}
            className="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
