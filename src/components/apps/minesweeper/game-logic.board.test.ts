// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  createBoard,
  createInitialState,
  placeMines,
  DIFFICULTIES,
  type Cell,
  type DifficultyConfig,
} from './game-logic';

function countMines(board: Cell[][]): number {
  return board.flat().filter((cell) => cell.mine).length;
}

describe('createBoard', () => {
  it('creates a grid of the configured size with hidden, mine-free cells', () => {
    const board = createBoard(DIFFICULTIES.beginner);
    expect(board).toHaveLength(9);
    expect(board[0]).toHaveLength(9);
    const flat = board.flat();
    expect(flat.every((cell) => cell.state === 'hidden')).toBe(true);
    expect(flat.every((cell) => !cell.mine)).toBe(true);
  });
});

describe('createInitialState', () => {
  it('starts idle with no mines placed', () => {
    const state = createInitialState(DIFFICULTIES.beginner);
    expect(state.status).toBe('idle');
    expect(state.minesPlaced).toBe(false);
    expect(state.flagCount).toBe(0);
  });
});

describe('placeMines', () => {
  const config: DifficultyConfig = {
    label: 'Small',
    rows: 5,
    cols: 5,
    mines: 5,
  };

  it('places exactly the requested number of mines', () => {
    const board = placeMines(createBoard(config), 2, 2, 5);
    expect(countMines(board)).toBe(5);
  });

  it('keeps the first-click cell and its neighbors mine-free', () => {
    const board = placeMines(createBoard(config), 2, 2, 5);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        expect(board[2 + dr][2 + dc].mine).toBe(false);
      }
    }
  });

  it('computes adjacent mine counts correctly', () => {
    const board = placeMines(createBoard(config), 2, 2, 5);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (board[r][c].mine) continue;
        let expected = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && board[nr][nc].mine)
              expected++;
          }
        }
        expect(board[r][c].adjacentMines).toBe(expected);
      }
    }
  });
});
