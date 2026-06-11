export type ProjectStatus = 'live' | 'wip' | 'archived';

export interface ProjectTechStack {
  name: string;
  status: ProjectStatus;
  languages: string[];
  frontend?: string[];
  backend?: string[];
  database?: string[];
  infra?: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface ProjectMeta {
  slug: string;
  summary: string;
  readme: string;
  techStack: ProjectTechStack;
}

const personalBlog: ProjectMeta = {
  slug: 'personal-blog',
  summary: 'Personal journal — writing about learning, building, life.',
  readme: [
    '# Personal Blog',
    '',
    "My journal. I write about what I'm learning, things I'm building,",
    'and the occasional thought that refuses to leave my head.',
    '',
    '## Why it exists',
    '',
    'Writing forces clarity. If I can explain something to a reader',
    "who has zero context, I probably understand it. If I can't, I don't.",
    '',
    '## Stack notes',
    '',
    '- React on the front, Express on the back — boring on purpose.',
    '- Clerk handles auth so I never touch passwords.',
    '- PostgreSQL because Postgres is forever.',
    '',
    'See `tech-stack.json` for the full breakdown.',
  ].join('\n'),
  techStack: {
    name: 'Personal Blog',
    status: 'live',
    languages: ['TypeScript', 'JavaScript'],
    frontend: ['React'],
    backend: ['Express', 'Node.js'],
    database: ['PostgreSQL'],
    infra: ['Clerk', 'Vercel'],
    liveUrl: 'https://blog.sahilbzy.com',
  },
};

const pioni: ProjectMeta = {
  slug: 'pioni',
  summary: 'Live trading intelligence — reads sentiment before markets move.',
  readme: [
    '# Pioni',
    '',
    'Live trading intelligence platform. Pioni reads human emotions and',
    'social sentiment to surface signals before the market reacts.',
    '',
    '## The bet',
    '',
    'Price action is downstream of attention. If you can read the room',
    "fast enough, you're not predicting the future — you're just",
    'listening more carefully than everyone else.',
    '',
    '## Stack notes',
    '',
    '- FastAPI for the ingestion + signals API.',
    '- PostgreSQL because time-series + relational both matter here.',
    '- Hosted on Render for now; will move when latency demands it.',
    '',
    'See `tech-stack.json` for the full breakdown.',
  ].join('\n'),
  techStack: {
    name: 'Pioni',
    status: 'live',
    languages: ['Python'],
    backend: ['FastAPI'],
    database: ['PostgreSQL'],
    infra: ['Render'],
    liveUrl: 'https://pioni.onrender.com',
  },
};

const tennisly: ProjectMeta = {
  slug: 'tennisly',
  summary: 'Interactive tennis match visualization and analytics.',
  readme: [
    '# Tennisly',
    '',
    'Interactive tennis match visualization and data analytics.',
    'Live court rendering, point-by-point replays, player-vs-player',
    'analytics.',
    '',
    '## Status: WIP',
    '',
    'Backend is the priority right now — match state machine, ingest',
    'from match feeds, and a clean analytics layer. The court canvas',
    'comes after the data is honest.',
    '',
    '## Stack notes',
    '',
    '- Spring Boot for the core service.',
    '- React + canvas for the court.',
    '- PostgreSQL for matches, players, points.',
    '',
    'See `tech-stack.json` for the full breakdown.',
  ].join('\n'),
  techStack: {
    name: 'Tennisly',
    status: 'wip',
    languages: ['Java', 'TypeScript'],
    frontend: ['React'],
    backend: ['Spring Boot'],
    database: ['PostgreSQL'],
  },
};

export const PROJECTS: readonly ProjectMeta[] = [personalBlog, pioni, tennisly];

export function formatTechSummary(stack: ProjectTechStack): string {
  const parts = [
    ...(stack.frontend ?? []),
    ...(stack.backend ?? []),
    ...(stack.database ?? []),
  ];
  if (parts.length === 0) return stack.languages.join(', ') || '—';
  return parts.join(', ');
}
