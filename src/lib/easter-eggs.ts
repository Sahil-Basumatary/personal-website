export type EasterEggOverlay = 'matrix' | 'sad-mac';

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;

export const FORTUNES: readonly string[] = [
  'A bug in the hand is better than one as yet undetected.',
  'You will write code that you are proud of. Not today, but soon.',
  'The early bird gets the worm, but the second mouse gets the cheese.',
  '"It works on my machine" is not a deployment strategy.',
  'Premature optimization is the root of all evil. - Donald Knuth',
  "There are 10 kinds of people in this world: those who understand binary, and those who don't.",
  'Real programmers count from 0.',
  'In theory, theory and practice are the same. In practice, they are not.',
  'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
  'Documentation is like sex: when it is good, it is very good; when it is bad, it is better than nothing.',
  'Ship it. Iterate later.',
  'The best error message is the one that never shows up.',
  'Make it work, make it right, make it fast - in that order.',
  'Naming things is one of the two hard problems in computer science. The others are cache invalidation and off-by-one errors.',
];

export const SAD_MAC_ERROR_CODES: readonly string[] = [
  '0000000F 00000003',
  '0000000F 0000FFFF',
  '00000001 00000004',
  '00000003 00000002',
  '0000000F 00000001',
];

export const SAD_MAC_MESSAGES: readonly string[] = [
  'A system error occurred.',
  'Sorry, a system error has occurred.',
  'The application "Reality" has unexpectedly quit.',
  'Address Error.',
  'Bus Error.',
];

export function buildCowsay(message: string): string[] {
  const text = message.trim() || 'Moo.';
  const width = Math.min(text.length, 40);
  const top = ' ' + '_'.repeat(width + 2);
  const bottom = ' ' + '-'.repeat(width + 2);
  const padded =
    text.length > width ? text.slice(0, width) : text.padEnd(width);
  const bubble = `< ${padded} >`;
  return [
    top,
    bubble,
    bottom,
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ];
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
