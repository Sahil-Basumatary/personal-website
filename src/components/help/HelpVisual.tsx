'use client';

import type { HelpVisualId } from '@/lib/help/topics';

export function HelpVisual({ visual }: { visual: HelpVisualId }) {
  return (
    <div className={`help-visual help-visual--${visual}`} aria-hidden="true">
      {visual === 'windows' ? (
        <div className="help-visual-stage">
          <div className="help-visual-window help-visual-window--back" />
          <div className="help-visual-window help-visual-window--front">
            <div className="help-visual-titlebar">
              <span className="help-visual-box" />
              <span className="help-visual-stripes" />
              <span className="help-visual-box" />
            </div>
            <div className="help-visual-window-body" />
          </div>
          <div className="help-visual-callout help-visual-callout--titlebar" />
        </div>
      ) : null}
      {visual === 'filesystem' ? (
        <div className="help-visual-stage">
          <div className="help-visual-finder">
            <div className="help-visual-sidebar" />
            <div className="help-visual-icons">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="help-visual-callout help-visual-callout--icons" />
        </div>
      ) : null}
      {visual === 'terminal' ? (
        <div className="help-visual-stage">
          <div className="help-visual-terminal">
            <div className="help-visual-terminal-line">$ help</div>
            <div className="help-visual-terminal-line help-visual-terminal-line--dim">
              ls · cd · open · neofetch
            </div>
            <div className="help-visual-terminal-line">
              $<span className="help-visual-cursor" />
            </div>
          </div>
        </div>
      ) : null}
      {visual === 'playground' ? (
        <div className="help-visual-stage">
          <div className="help-visual-playground">
            <div className="help-visual-code">
              <span />
              <span />
              <span />
            </div>
            <div className="help-visual-output">Run ⌘↵</div>
          </div>
          <div className="help-visual-callout help-visual-callout--run" />
        </div>
      ) : null}
      {visual === 'gestures' ? (
        <div className="help-visual-stage">
          <div className="help-visual-icon-tile" />
          <div className="help-visual-tap help-visual-tap--one">1</div>
          <div className="help-visual-tap help-visual-tap--two">2</div>
        </div>
      ) : null}
      {visual === 'easter-eggs' ? (
        <div className="help-visual-stage">
          <div className="help-visual-egg">?</div>
          <div className="help-visual-callout help-visual-callout--egg" />
        </div>
      ) : null}
    </div>
  );
}
