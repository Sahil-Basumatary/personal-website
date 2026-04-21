'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  type GameState,
  type DifficultyConfig,
  DIFFICULTIES,
  createInitialState,
  revealCell,
  toggleFlag,
  chordReveal,
  getRemainingMines,
} from './game-logic';

type SmileyState = 'smile' | 'surprised' | 'dead' | 'cool';

interface HighScore {
  difficulty: string;
  time: number;
  date: string;
}

const NUMBER_COLORS: Record<number, string> = {
  1: '#0000ff',
  2: '#008000',
  3: '#ff0000',
  4: '#000080',
  5: '#800000',
  6: '#008080',
  7: '#000000',
  8: '#808080',
};

const SMILEY_MAP: Record<SmileyState, string> = {
  smile: '🙂',
  surprised: '😮',
  dead: '💀',
  cool: '😎',
};

const STORAGE_KEY = 'minesweeper-highscores';

function loadHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHighScore(difficulty: string, time: number) {
  const scores = loadHighScores();
  scores.push({ difficulty, time, date: new Date().toISOString() });
  scores.sort((a, b) => a.time - b.time);
  const trimmed = scores.slice(0, 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

function getBestTime(difficulty: string): number | null {
  const scores = loadHighScores().filter((s) => s.difficulty === difficulty);
  return scores.length > 0 ? scores[0].time : null;
}

function formatCounter(n: number): string {
  const clamped = Math.max(-99, Math.min(999, n));
  if (clamped < 0) return '-' + String(Math.abs(clamped)).padStart(2, '0');
  return String(clamped).padStart(3, '0');
}

export function Minesweeper() {
  const [difficultyKey, setDifficultyKey] = useState('beginner');
  const difficulty = DIFFICULTIES[difficultyKey];
  const [game, setGame] = useState<GameState>(() =>
    createInitialState(difficulty)
  );
  const [time, setTime] = useState(0);
  const [smiley, setSmiley] = useState<SmileyState>('smile');
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mouseDownRef = useRef(false);

  useEffect(() => {
    setBestTime(getBestTime(difficultyKey));
  }, [difficultyKey]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTime((t) => Math.min(t + 1, 999));
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  useEffect(() => {
    if (game.status === 'won') {
      stopTimer();
      setSmiley('cool');
      saveHighScore(difficultyKey, time);
      setBestTime(getBestTime(difficultyKey));
    } else if (game.status === 'lost') {
      stopTimer();
      setSmiley('dead');
    }
  }, [game.status, stopTimer, difficultyKey, time]);

  const handleReset = useCallback(
    (config?: DifficultyConfig) => {
      stopTimer();
      setGame(createInitialState(config ?? difficulty));
      setTime(0);
      setSmiley('smile');
    },
    [stopTimer, difficulty]
  );

  const handleDifficultyChange = useCallback(
    (key: string) => {
      setDifficultyKey(key);
      const config = DIFFICULTIES[key];
      handleReset(config);
      setBestTime(getBestTime(key));
    },
    [handleReset]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (game.status === 'won' || game.status === 'lost') return;
      let next = game;
      if (game.status === 'idle') {
        startTimer();
      }
      const cell = game.board[row][col];
      if (cell.state === 'revealed' && cell.adjacentMines > 0) {
        next = chordReveal(game, row, col);
      } else {
        next = revealCell(game, row, col);
      }
      setGame(next);
    },
    [game, startTimer]
  );

  const handleCellRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (game.status === 'won' || game.status === 'lost') return;
      setGame(toggleFlag(game, row, col));
    },
    [game]
  );

  const handleCellMouseDown = useCallback(() => {
    if (game.status === 'playing' || game.status === 'idle') {
      mouseDownRef.current = true;
      setSmiley('surprised');
    }
  }, [game.status]);

  const handleCellMouseUp = useCallback(() => {
    mouseDownRef.current = false;
    if (game.status === 'playing') {
      setSmiley('smile');
    }
  }, [game.status]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseDownRef.current) {
        mouseDownRef.current = false;
        if (game.status === 'playing') setSmiley('smile');
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [game.status]);

  const remaining = getRemainingMines(game);

  return (
    <div className="minesweeper">
      <div className="minesweeper-toolbar">
        <select
          className="minesweeper-select"
          value={difficultyKey}
          onChange={(e) => handleDifficultyChange(e.target.value)}
        >
          {Object.entries(DIFFICULTIES).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
        {bestTime !== null && (
          <span className="minesweeper-best">Best: {bestTime}s</span>
        )}
      </div>
      <div className="minesweeper-status-bar">
        <div className="minesweeper-counter">{formatCounter(remaining)}</div>
        <button
          className="minesweeper-smiley"
          onClick={() => handleReset()}
          aria-label="New Game"
        >
          {SMILEY_MAP[smiley]}
        </button>
        <div className="minesweeper-counter">{formatCounter(time)}</div>
      </div>
      <div
        className="minesweeper-board"
        style={{
          gridTemplateColumns: `repeat(${game.difficulty.cols}, 1fr)`,
          gridTemplateRows: `repeat(${game.difficulty.rows}, 1fr)`,
        }}
        onMouseLeave={handleCellMouseUp}
      >
        {game.board.map((row) =>
          row.map((cell) => {
            let content = '';
            let cellClass = 'minesweeper-cell';
            let numberColor: string | undefined;
            if (cell.state === 'revealed') {
              cellClass += ' revealed';
              if (cell.mine) {
                cellClass += ' mine';
                content = '💣';
              } else if (cell.adjacentMines > 0) {
                content = String(cell.adjacentMines);
                numberColor = NUMBER_COLORS[cell.adjacentMines];
              }
            } else if (cell.state === 'flagged') {
              cellClass += ' flagged';
              content = '🚩';
            }
            return (
              <button
                key={`${cell.row}-${cell.col}`}
                className={cellClass}
                style={numberColor ? { color: numberColor } : undefined}
                onClick={() => handleCellClick(cell.row, cell.col)}
                onContextMenu={(e) =>
                  handleCellRightClick(e, cell.row, cell.col)
                }
                onMouseDown={handleCellMouseDown}
                onMouseUp={handleCellMouseUp}
                aria-label={`Cell ${cell.row},${cell.col}`}
              >
                {content}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
