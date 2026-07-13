export const MATRIX_GLYPHS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789';
export const MATRIX_FONT_SIZE = 16;

export interface MatrixCell {
  x: number;
  y: number;
  char: string;
  head: boolean;
  alpha: number;
}

export function buildStaticMatrixCells(
  width: number,
  height: number,
  random: () => number = Math.random
): MatrixCell[] {
  const columns = Math.max(1, Math.floor(width / MATRIX_FONT_SIZE));
  const rows = Math.max(1, Math.floor(height / MATRIX_FONT_SIZE));
  const cells: MatrixCell[] = [];

  for (let column = 0; column < columns; column += 1) {
    const trail = Math.max(1, Math.floor(random() * rows));
    for (let row = 0; row < trail; row += 1) {
      const charIndex = Math.floor(random() * MATRIX_GLYPHS.length);
      cells.push({
        x: column * MATRIX_FONT_SIZE,
        y: (row + 1) * MATRIX_FONT_SIZE,
        char: MATRIX_GLYPHS.charAt(charIndex),
        head: row === trail - 1,
        alpha: 0.25 + (row / trail) * 0.75,
      });
    }
  }

  return cells;
}

export function paintMatrixCells(
  ctx: Pick<
    CanvasRenderingContext2D,
    'fillStyle' | 'fillRect' | 'font' | 'fillText' | 'globalAlpha'
  >,
  width: number,
  height: number,
  cells: MatrixCell[]
): void {
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${MATRIX_FONT_SIZE}px Geneva, Monaco, monospace`;

  for (const cell of cells) {
    ctx.globalAlpha = cell.alpha;
    ctx.fillStyle = cell.head ? '#ccffcc' : '#00ff41';
    ctx.fillText(cell.char, cell.x, cell.y);
  }

  ctx.globalAlpha = 1;
}
