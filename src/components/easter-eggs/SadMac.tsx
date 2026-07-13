'use client';
import { useMemo } from 'react';
import {
  pickRandom,
  SAD_MAC_ERROR_CODES,
  SAD_MAC_MESSAGES,
} from '@/lib/easter-eggs';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

interface SadMacProps {
  onDismiss: () => void;
}

export function SadMac({ onDismiss }: SadMacProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const errorCode = useMemo(() => pickRandom(SAD_MAC_ERROR_CODES), []);
  const message = useMemo(() => pickRandom(SAD_MAC_MESSAGES), []);

  return (
    <div
      className={
        prefersReducedMotion
          ? 'easter-egg-overlay sad-mac-overlay sad-mac-overlay--static'
          : 'easter-egg-overlay sad-mac-overlay'
      }
      onClick={onDismiss}
      role="alertdialog"
      aria-label="System Error"
      aria-describedby="sad-mac-message sad-mac-code"
    >
      <div className="sad-mac-frame">
        <SadMacFace />
        <div id="sad-mac-message" className="sad-mac-message">
          {message}
        </div>
        <div id="sad-mac-code" className="sad-mac-code">
          {errorCode}
        </div>
        <div className="sad-mac-hint">
          {prefersReducedMotion
            ? 'click anywhere or press ESC to continue'
            : 'click anywhere to restart'}
        </div>
      </div>
    </div>
  );
}

function SadMacFace() {
  const PIXEL = 8;
  const W = 24;
  const H = 24;
  const grid: string[] = [
    '........................',
    '........................',
    '....XXXXXXXXXXXXXXXX....',
    '...X..............X.....',
    '..X................X....',
    '.X..................X...',
    'X....................X..',
    'X.XX..............XX.X..',
    'X.XX..............XX.X..',
    'X....................X..',
    'X....................X..',
    'X....................X..',
    'X......XXXXXXXXX.....X..',
    'X.....X.........X....X..',
    'X....X...........X...X..',
    'X....X...........X...X..',
    'X....................X..',
    'X....................X..',
    '.X..................X...',
    '..X................X....',
    '...X..............X.....',
    '....XXXXXXXXXXXXXX......',
    '........................',
    '........................',
  ];
  const rects: React.ReactElement[] = [];
  for (let y = 0; y < H; y++) {
    const row = grid[y];
    for (let x = 0; x < W; x++) {
      if (row[x] === 'X') {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x * PIXEL}
            y={y * PIXEL}
            width={PIXEL}
            height={PIXEL}
            fill="#ffffff"
          />
        );
      }
    }
  }
  return (
    <svg
      className="sad-mac-face"
      viewBox={`0 0 ${W * PIXEL} ${H * PIXEL}`}
      width={W * PIXEL}
      height={H * PIXEL}
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}
