export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HelpArrowGeometry {
  path: string;
  tip: Point;
  tipAngle: number;
  labelAt: Point;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/** Point on the rect border where a ray from the center toward `toward` exits. */
export function edgePointToward(rect: Rect, toward: Point): Point {
  const center = rectCenter(rect);
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  if (dx === 0 && dy === 0) {
    return { x: rect.x + rect.width, y: center.y };
  }
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const scaleX =
    absDx < 0.0001 ? Number.POSITIVE_INFINITY : rect.width / 2 / absDx;
  const scaleY =
    absDy < 0.0001 ? Number.POSITIVE_INFINITY : rect.height / 2 / absDy;
  const scale = Math.min(scaleX, scaleY);
  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

function nudge(point: Point, toward: Point, amount: number): Point {
  const dx = toward.x - point.x;
  const dy = toward.y - point.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 0.0001) return point;
  return {
    x: point.x + (dx / distance) * amount,
    y: point.y + (dy / distance) * amount,
  };
}

export function buildHelpArrow(
  card: Rect,
  anchor: Rect,
  wobble = 0.2
): HelpArrowGeometry | null {
  if (
    card.width <= 0 ||
    card.height <= 0 ||
    anchor.width <= 0 ||
    anchor.height <= 0
  ) {
    return null;
  }

  const cardMid = rectCenter(card);
  const anchorMid = rectCenter(anchor);
  const from = nudge(edgePointToward(card, anchorMid), anchorMid, 4);
  const to = nudge(edgePointToward(anchor, cardMid), cardMid, -6);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 12) return null;

  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const nx = -dy / distance;
  // Longer runs get a bigger scribble bend so the pointer still feels intentional.
  const bend = clamp(distance * wobble, 18, Math.min(110, distance * 0.38));
  const favorUp = my > 280 ? -1 : 1;
  const control = {
    x: mx + nx * bend * 0.55,
    y: my + favorUp * Math.abs(bend) * (distance < 100 ? 0.55 : 0.9),
  };
  const tipAngle = Math.atan2(to.y - control.y, to.x - control.x);
  const labelAt = {
    x: control.x + nx * 14,
    y: control.y + favorUp * 12,
  };

  return {
    path: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
    tip: to,
    tipAngle,
    labelAt,
  };
}

export function arrowHeadPoints(tip: Point, angle: number, size = 14): string {
  const left = angle + Math.PI * 0.78;
  const right = angle - Math.PI * 0.78;
  const a = {
    x: tip.x + Math.cos(left) * size,
    y: tip.y + Math.sin(left) * size,
  };
  const b = {
    x: tip.x + Math.cos(right) * size,
    y: tip.y + Math.sin(right) * size,
  };
  return `${a.x.toFixed(1)},${a.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
}
