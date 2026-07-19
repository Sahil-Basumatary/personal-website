export type StoryInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: StoryInline[] }
  | { type: 'em'; children: StoryInline[] }
  | { type: 'code'; text: string }
  | { type: 'link'; href: string; children: StoryInline[] };

export type StoryBlock =
  | { type: 'heading'; level: 1 | 2 | 3; children: StoryInline[] }
  | { type: 'paragraph'; children: StoryInline[] }
  | { type: 'list'; ordered: false; items: StoryInline[][] };

const SAFE_HREF = /^https?:\/\//i;

function pushText(parts: StoryInline[], text: string): void {
  if (!text) return;
  const last = parts[parts.length - 1];
  if (last?.type === 'text') {
    last.text += text;
    return;
  }
  parts.push({ type: 'text', text });
}

export function parseInlineMarkdown(input: string): StoryInline[] {
  const parts: StoryInline[] = [];
  let i = 0;

  while (i < input.length) {
    if (input[i] === '`') {
      const end = input.indexOf('`', i + 1);
      if (end > i) {
        parts.push({ type: 'code', text: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (input.startsWith('**', i)) {
      const end = input.indexOf('**', i + 2);
      if (end > i) {
        parts.push({
          type: 'strong',
          children: parseInlineMarkdown(input.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }

    if (input[i] === '*' && input[i + 1] !== '*') {
      const end = input.indexOf('*', i + 1);
      if (end > i) {
        parts.push({
          type: 'em',
          children: parseInlineMarkdown(input.slice(i + 1, end)),
        });
        i = end + 1;
        continue;
      }
    }

    if (input[i] === '[') {
      const labelEnd = input.indexOf(']', i + 1);
      if (
        labelEnd > i &&
        input[labelEnd + 1] === '(' &&
        input.indexOf(')', labelEnd + 2) > labelEnd
      ) {
        const hrefEnd = input.indexOf(')', labelEnd + 2);
        const href = input.slice(labelEnd + 2, hrefEnd).trim();
        const label = input.slice(i + 1, labelEnd);
        if (SAFE_HREF.test(href)) {
          parts.push({
            type: 'link',
            href,
            children: parseInlineMarkdown(label),
          });
          i = hrefEnd + 1;
          continue;
        }
      }
    }

    pushText(parts, input[i]!);
    i += 1;
  }

  return parts;
}

function isUnorderedListLine(line: string): boolean {
  return /^[-*] /.test(line);
}

export function parseStoryMarkdown(source: string): StoryBlock[] {
  const normalized = source.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const chunks = normalized.split(/\n{2,}/);
  const blocks: StoryBlock[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((line) => line.trimEnd());
    if (lines.every((line) => line.trim() === '')) continue;

    const heading = /^(#{1,3}) (.+)$/.exec(lines[0] ?? '');
    if (heading && lines.length === 1) {
      const level = heading[1]!.length as 1 | 2 | 3;
      blocks.push({
        type: 'heading',
        level,
        children: parseInlineMarkdown(heading[2]!),
      });
      continue;
    }

    if (lines.every(isUnorderedListLine)) {
      blocks.push({
        type: 'list',
        ordered: false,
        items: lines.map((line) => parseInlineMarkdown(line.slice(2))),
      });
      continue;
    }

    blocks.push({
      type: 'paragraph',
      children: parseInlineMarkdown(
        lines.join(' ').replace(/\s+/g, ' ').trim()
      ),
    });
  }

  return blocks;
}
