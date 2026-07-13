export const UNTITLED_DOCUMENT_TITLE = 'untitled';

const UNTITLED_PATTERN = /^untitled(?: (\d+))?$/;

export function nextUntitledTitle(existingTitles: string[]): string {
  let hasBase = false;
  const usedNumbers = new Set<number>();
  for (const title of existingTitles) {
    const match = UNTITLED_PATTERN.exec(title);
    if (!match) continue;
    if (match[1] === undefined) {
      hasBase = true;
      continue;
    }
    usedNumbers.add(Number(match[1]));
  }
  if (!hasBase) return UNTITLED_DOCUMENT_TITLE;
  let next = 2;
  while (usedNumbers.has(next)) next += 1;
  return `${UNTITLED_DOCUMENT_TITLE} ${next}`;
}

export function openUntitledDocument(
  openWindow: (config: {
    title: string;
    component: string;
    size?: { width: number; height: number };
  }) => string,
  existingTitles: string[]
): string {
  return openWindow({
    title: nextUntitledTitle(existingTitles),
    component: 'text-editor',
    size: { width: 500, height: 350 },
  });
}
