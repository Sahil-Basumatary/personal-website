// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  revealCell,
  toggleFlag,
  chordReveal,
  getRemainingMines,
  DIFFICULTIES,
  type Cell,
  type GameState,
  type DifficultyConfig,
} from './game-logic';

function countMines(board: Cell[][]): number {
  return board.flat().filter((cell) => cell.mine).length;
}

// Builds a deterministic mid-game state from an explicit mine layout so tests
// don't depend on the randomized first-click placement.
function buildPlayingState(mines: boolean[][]): GameState {
  const rows = mines.length;
  const cols = mines[0].length;
  const board: Cell[][] = mines.map((rowMines, r) =>
    rowMines.map((mine, c) => ({
      row: r,
      col: c,
      mine,
      adjacentMines: 0,
      state: 'hidden' as const,
    }))
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            board[nr][nc].mine
          )
            count++;
        }
      }
      board[r][c].adjacentMines = count;
    }
  }
  const difficulty: DifficultyConfig = {
    label: 'Test',
    rows,
    cols,
    mines: countMines(board),
  };
  return {
    board,
    status: 'playing',
    difficulty,
    minesPlaced: true,
    flagCount: 0,
  };
}

describe('revealCell', () => {
  it('places mines on the first click and never detonates it', () => {
    const state = createInitialState({
      label: 'Small',
      rows: 5,
      cols: 5,
      mines: 5,
    });
    const next = revealCell(state, 2, 2);
    expect(next.minesPlaced).toBe(true);
    expect(next.board[2][2].mine).toBe(false);
    expect(next.board[2][2].state).toBe('revealed');
    expect(next.status === 'playing' || next.status === 'won').toBe(true);
  });

  it('flood-fills and wins on a mine-free board', () => {
    const state = createInitialState({
      label: 'Empty',
      rows: 3,
      cols: 3,
      mines: 0,
    });
    const next = revealCell(state, 1, 1);
    expect(next.board.flat().every((cell) => cell.state === 'revealed')).toBe(
      true
    );
    expect(next.status).toBe('won');
  });

  it('loses and reveals all mines when a mine is clicked', () => {
    const state = buildPlayingState([
      [true, false],
      [false, false],
    ]);
    const next = revealCell(state, 0, 0);
    expect(next.status).toBe('lost');
    expect(next.board[0][0].state).toBe('revealed');
  });

  it('ignores clicks once the game is over', () => {
    const lost = buildPlayingState([
      [true, false],
      [false, false],
    ]);
    lost.status = 'lost';
    expect(revealCell(lost, 1, 1)).toBe(lost);
  });

  it('ignores clicks on already-revealed cells', () => {
    const state = buildPlayingState([
      [false, true],
      [false, false],
    ]);
    const revealed = revealCell(state, 0, 0);
    expect(revealCell(revealed, 0, 0)).toBe(revealed);
  });
});

describe('toggleFlag', () => {
  it('flags and unflags a hidden cell while playing', () => {
    const state = buildPlayingState([
      [true, false],
      [false, false],
    ]);
    const flagged = toggleFlag(state, 0, 1);
    expect(flagged.board[0][1].state).toBe('flagged');
    expect(flagged.flagCount).toBe(1);
    const unflagged = toggleFlag(flagged, 0, 1);
    expect(unflagged.board[0][1].state).toBe('hidden');
    expect(unflagged.flagCount).toBe(0);
  });

  it('does not flag a revealed cell', () => {
    const state = buildPlayingState([
      [false, true],
      [false, false],
    ]);
    const revealed = revealCell(state, 0, 0);
    expect(toggleFlag(revealed, 0, 0)).toBe(revealed);
  });

  it('does nothing when the game is idle', () => {
    const state = createInitialState(DIFFICULTIES.beginner);
    expect(toggleFlag(state, 0, 0)).toBe(state);
  });
});

describe('chordReveal', () => {
  it('reveals hidden neighbors when flags match the number', () => {
    let state = buildPlayingState([
      [true, false, false],
      [false, false, false],
      [false, false, false],
    ]);
    state = revealCell(state, 1, 1);
    state = toggleFlag(state, 0, 0);
    const chorded = chordReveal(state, 1, 1);
    expect(chorded.board[2][2].state).toBe('revealed');
    expect(chorded.status).not.toBe('lost');
  });

  it('does nothing when the flag count does not match', () => {
    let state = buildPlayingState([
      [true, false, false],
      [false, false, false],
      [false, false, false],
    ]);
    state = revealCell(state, 1, 1);
    expect(chordReveal(state, 1, 1)).toBe(state);
  });
});

describe('getRemainingMines', () => {
  it('returns mines minus flags', () => {
    const state = createInitialState(DIFFICULTIES.beginner);
    expect(getRemainingMines(state)).toBe(10);
    expect(getRemainingMines({ ...state, flagCount: 3 })).toBe(7);
  });
});
