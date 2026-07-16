import type { HelpAnchorId } from './placement';

export const HELP_CARD_IDS = [
  'windows',
  'filesystem',
  'terminal',
  'playground',
  'gestures',
  'easter-eggs',
] as const;

export type HelpCardId = (typeof HELP_CARD_IDS)[number];

export type HelpVisualId =
  | 'windows'
  | 'filesystem'
  | 'terminal'
  | 'playground'
  | 'gestures'
  | 'easter-eggs';

export interface HelpCard {
  id: HelpCardId;
  headline: string;
  body: string;
  visual: HelpVisualId;
  anchor: HelpAnchorId;
  arrowLabel: string;
}

export const HELP_CARDS: readonly HelpCard[] = [
  {
    id: 'windows',
    headline: 'Move and close windows',
    body: 'Drag the striped title bar to move. Double-click it to shade. ⌘W for closing; ⌘M for back to dock',
    visual: 'windows',
    anchor: 'dock',
    arrowLabel: 'dock is here',
  },
  {
    id: 'filesystem',
    headline: 'Open Macintosh HD',
    body: 'Double-click the disk to browse folders and apps. ',
    visual: 'filesystem',
    anchor: 'system-drive',
    arrowLabel: 'start here',
  },
  {
    id: 'terminal',
    headline: 'Use the Terminal',
    body: 'Type help for commands. Try ls, cd, projects, or open Code Playground.',
    visual: 'terminal',
    anchor: 'terminal',
    arrowLabel: 'this one',
  },
  {
    id: 'playground',
    headline: 'Run code here',
    body: 'Pick a snippet, then press ⌘↵ / Ctrl+Enter. Python may take some moment on first run',
    visual: 'playground',
    anchor: 'code-playground',
    arrowLabel: 'code here',
  },
  {
    id: 'gestures',
    headline: 'Tap twice to open',
    body: 'Tap once to select an icon, then quickly tap again. Muted sound by default.',
    visual: 'gestures',
    anchor: 'menubar-audio',
    arrowLabel: 'sounds here',
  },
  {
    id: 'easter-eggs',
    headline: 'Hidden surprises',
    body: 'Explore past help in Terminal. If the screen is buggy, click or press Escape.',
    visual: 'easter-eggs',
    anchor: 'terminal',
    arrowLabel: 'Take a look here',
  },
];

export function isHelpCardId(value: string): value is HelpCardId {
  return (HELP_CARD_IDS as readonly string[]).includes(value);
}

export function getHelpCard(id: string): HelpCard | undefined {
  if (!isHelpCardId(id)) return undefined;
  return HELP_CARDS.find((card) => card.id === id);
}

export function listHelpCards(): readonly HelpCard[] {
  return HELP_CARDS;
}

export function clampHelpStep(
  index: number,
  length = HELP_CARDS.length
): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

export function nextHelpStep(
  index: number,
  length = HELP_CARDS.length
): number {
  return clampHelpStep(index + 1, length);
}

export function prevHelpStep(
  index: number,
  length = HELP_CARDS.length
): number {
  return clampHelpStep(index - 1, length);
}

export function isLastHelpStep(
  index: number,
  length = HELP_CARDS.length
): boolean {
  if (length <= 0) return true;
  return clampHelpStep(index, length) === length - 1;
}
