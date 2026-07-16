export type HelpAnchorId =
  | 'desktop-stage'
  | 'system-drive'
  | 'terminal'
  | 'code-playground'
  | 'desktop-icons'
  | 'dock'
  | 'menubar-audio';

export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CardSize {
  width: number;
  height: number;
}

export interface HelpPlacement {
  left: number;
  top: number;
}

const MARGIN = 12;
/** Target gap card↔anchor so the arrow reads as a real pointer, not a stub. */
const GAP = 128;

export function helpAnchorSelector(anchor: HelpAnchorId): string {
  return `[data-help-anchor="${anchor}"]`;
}

export function edgeClearance(
  left: number,
  top: number,
  card: CardSize,
  anchor: AnchorRect
): number {
  const cardRight = left + card.width;
  const cardBottom = top + card.height;
  const anchorRight = anchor.x + anchor.width;
  const anchorBottom = anchor.y + anchor.height;
  const gapLeft = anchor.x - cardRight;
  const gapRight = left - anchorRight;
  const gapTop = anchor.y - cardBottom;
  const gapBottom = top - anchorBottom;
  const best = Math.max(gapLeft, gapRight, gapTop, gapBottom);
  if (best < 0) return best;
  const overlapsX = left < anchorRight && cardRight > anchor.x;
  const overlapsY = top < anchorBottom && cardBottom > anchor.y;
  if (overlapsX && overlapsY) return -1;
  return best;
}

function pushAway(
  left: number,
  top: number,
  card: CardSize,
  anchor: AnchorRect,
  minLeft: number,
  maxLeft: number,
  minTop: number,
  maxTop: number,
  minGap: number
): HelpPlacement {
  let L = left;
  let T = top;
  const cardCx = L + card.width / 2;
  const cardCy = T + card.height / 2;
  const ax = anchor.x + anchor.width / 2;
  const ay = anchor.y + anchor.height / 2;
  const dx = cardCx - ax;
  const dy = cardCy - ay;

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx <= 0) {
      L = Math.min(L, anchor.x - card.width - minGap);
    } else {
      L = Math.max(L, anchor.x + anchor.width + minGap);
    }
  } else if (dy <= 0) {
    T = Math.min(T, anchor.y - card.height - minGap);
  } else {
    T = Math.max(T, anchor.y + anchor.height + minGap);
  }

  L = Math.max(minLeft, Math.min(L, maxLeft));
  T = Math.max(minTop, Math.min(T, maxTop));

  // If still cramped after the primary axis shove, use leftover room on the other axis.
  if (edgeClearance(L, T, card, anchor) < minGap * 0.75) {
    if (dx <= 0)
      L = Math.max(minLeft, Math.min(anchor.x - card.width - minGap, maxLeft));
    else
      L = Math.max(
        minLeft,
        Math.min(Math.max(L, anchor.x + anchor.width + minGap), maxLeft)
      );
    if (dy <= 0)
      T = Math.max(minTop, Math.min(anchor.y - card.height - minGap, maxTop));
    else
      T = Math.max(
        minTop,
        Math.min(Math.max(T, anchor.y + anchor.height + minGap), maxTop)
      );
  }

  return { left: L, top: T };
}

export function placeHelpCard(options: {
  anchor: AnchorRect | null;
  card: CardSize;
  viewport: ViewportSize;
  prefer?: 'start' | 'end' | 'auto';
}): HelpPlacement {
  const { card, viewport } = options;
  const prefer = options.prefer ?? 'auto';
  const maxLeft = Math.max(0, viewport.width - card.width - MARGIN);
  const maxTop = Math.max(0, viewport.height - card.height - MARGIN);
  const minLeft = Math.min(MARGIN, maxLeft);
  const minTop = Math.min(MARGIN, maxTop);

  if (!options.anchor) {
    return {
      left: minLeft,
      top: Math.min(
        Math.max(minTop, viewport.height - card.height - 44),
        maxTop
      ),
    };
  }

  const anchor = options.anchor;
  const anchorCenterX = anchor.x + anchor.width / 2;
  const anchorCenterY = anchor.y + anchor.height / 2;
  const preferStart =
    prefer === 'start' ||
    (prefer === 'auto' && anchorCenterX > viewport.width / 2);

  // Wide bottom anchors (dock): sit above-left so the arrow runs down.
  const looksLikeDock =
    anchor.width > viewport.width * 0.35 &&
    anchorCenterY > viewport.height * 0.7;

  let left: number;
  let top: number;

  if (looksLikeDock) {
    left = minLeft;
    top = Math.min(anchor.y - card.height - GAP, maxTop);
    top = Math.max(minTop, top);
  } else {
    const startLeft = anchor.x - card.width - GAP;
    const endLeft = anchor.x + anchor.width + GAP;
    left = preferStart ? startLeft : endLeft;
    top = anchor.y + anchor.height / 2 - card.height / 2;

    if (preferStart && startLeft < minLeft && endLeft <= maxLeft) {
      left = endLeft;
    } else if (!preferStart && endLeft > maxLeft && startLeft >= minLeft) {
      left = startLeft;
    }

    top = Math.max(minTop, Math.min(top, maxTop));
    left = Math.max(minLeft, Math.min(left, maxLeft));
  }

  if (edgeClearance(left, top, card, anchor) < GAP) {
    return pushAway(
      left,
      top,
      card,
      anchor,
      minLeft,
      maxLeft,
      minTop,
      maxTop,
      GAP
    );
  }

  return { left, top };
}
