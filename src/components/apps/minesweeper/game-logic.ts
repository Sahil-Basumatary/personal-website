export type CellState = 'hidden' | 'revealed' | 'flagged';

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface Cell {
  row: number;
  col: number;
  mine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface DifficultyConfig {
  label: string;
  rows: number;
  cols: number;
  mines: number;
}

export interface GameState {
  board: Cell[][];
  status: GameStatus;
  difficulty: DifficultyConfig;
  minesPlaced: boolean;
  flagCount: number;
}

export const DIFFICULTIES: Record<string, DifficultyConfig> = {
  beginner: { label: 'Beginner', rows: 9, cols: 9, mines: 10 },
  intermediate: { label: 'Intermediate', rows: 16, cols: 16, mines: 40 },
  expert: { label: 'Expert', rows: 16, cols: 30, mines: 99 },
};

function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number
): [number, number][] {
  const neighbors: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

export function createBoard(config: DifficultyConfig): Cell[][] {
  const board: Cell[][] = [];
  for (let r = 0; r < config.rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < config.cols; c++) {
      row.push({
        row: r,
        col: c,
        mine: false,
        adjacentMines: 0,
        state: 'hidden',
      });
    }
    board.push(row);
  }
  return board;
}

export function createInitialState(difficulty: DifficultyConfig): GameState {
  return {
    board: createBoard(difficulty),
    status: 'idle',
    difficulty,
    minesPlaced: false,
    flagCount: 0,
  };
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function placeMines(
  board: Cell[][],
  safeRow: number,
  safeCol: number,
  mineCount: number
): Cell[][] {
  const newBoard = cloneBoard(board);
  const rows = newBoard.length;
  const cols = newBoard[0].length;
  const safeZone = new Set<string>();
  safeZone.add(`${safeRow},${safeCol}`);
  for (const [nr, nc] of getNeighbors(safeRow, safeCol, rows, cols)) {
    safeZone.add(`${nr},${nc}`);
  }
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (newBoard[r][c].mine || safeZone.has(`${r},${c}`)) continue;
    newBoard[r][c].mine = true;
    placed++;
  }
  return calculateAdjacent(newBoard);
}

function calculateAdjacent(board: Cell[][]): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
        if (board[nr][nc].mine) count++;
      }
      board[r][c].adjacentMines = count;
    }
  }
  return board;
}

export function revealCell(
  state: GameState,
  row: number,
  col: number
): GameState {
  if (state.status === 'won' || state.status === 'lost') return state;
  let board = cloneBoard(state.board);
  let { status, minesPlaced } = state;
  const { flagCount } = state;
  const { difficulty } = state;
  if (!minesPlaced) {
    board = placeMines(board, row, col, difficulty.mines);
    minesPlaced = true;
    status = 'playing';
  }
  const cell = board[row][col];
  if (cell.state !== 'hidden') return state;
  if (cell.mine) {
    board = revealAllMines(board);
    return { board, status: 'lost', difficulty, minesPlaced, flagCount };
  }
  // BFS flood fill for zero-adjacent cells
  const queue: [number, number][] = [[row, col]];
  const visited = new Set<string>();
  visited.add(`${row},${col}`);
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const current = board[r][c];
    if (current.state !== 'hidden' || current.mine) continue;
    current.state = 'revealed';
    if (current.adjacentMines === 0) {
      for (const [nr, nc] of getNeighbors(
        r,
        c,
        board.length,
        board[0].length
      )) {
        const key = `${nr},${nc}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }
  }
  const won = checkWin(board);
  return {
    board,
    status: won ? 'won' : status,
    difficulty,
    minesPlaced,
    flagCount,
  };
}

export function toggleFlag(
  state: GameState,
  row: number,
  col: number
): GameState {
  if (state.status === 'won' || state.status === 'lost') return state;
  if (state.status === 'idle') return state;
  const board = cloneBoard(state.board);
  const cell = board[row][col];
  if (cell.state === 'revealed') return state;
  let { flagCount } = state;
  if (cell.state === 'flagged') {
    cell.state = 'hidden';
    flagCount--;
  } else {
    cell.state = 'flagged';
    flagCount++;
  }
  return { ...state, board, flagCount };
}

export function chordReveal(
  state: GameState,
  row: number,
  col: number
): GameState {
  if (state.status !== 'playing') return state;
  const cell = state.board[row][col];
  if (cell.state !== 'revealed' || cell.adjacentMines === 0) return state;
  const neighbors = getNeighbors(
    row,
    col,
    state.board.length,
    state.board[0].length
  );
  const flaggedCount = neighbors.filter(
    ([r, c]) => state.board[r][c].state === 'flagged'
  ).length;
  if (flaggedCount !== cell.adjacentMines) return state;
  let result = state;
  for (const [nr, nc] of neighbors) {
    if (result.board[nr][nc].state === 'hidden') {
      result = revealCell(result, nr, nc);
      if (result.status === 'lost') return result;
    }
  }
  return result;
}

function revealAllMines(board: Cell[][]): Cell[][] {
  for (const row of board) {
    for (const cell of row) {
      if (cell.mine) cell.state = 'revealed';
    }
  }
  return board;
}

function checkWin(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine && cell.state !== 'revealed') return false;
    }
  }
  return true;
}

export function getRemainingMines(state: GameState): number {
  return state.difficulty.mines - state.flagCount;
}
