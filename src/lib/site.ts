const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sahilbzy.com';

// Normalized origin (no trailing slash) used as the single source of truth for
// canonical URLs, Open Graph tags, the sitemap, and JSON-LD across the app.
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const SITE = {
  name: "Sahil's Computer",
  shortName: "Sahil's PC",
  // Put the searchable personal brand first so Google can match "Sahil Bzy".
  title: "Sahil Basumatary (Sahil Bzy) · Sahil's Computer",
  description:
    'Sahil Basumatary (Sahil Bzy) — personal portfolio at sahilbzy.com, rebuilt as a Mac OS 9-inspired desktop. Explore projects, skills, writing, Terminal, and Help through an interactive Platinum interface.',
  author: 'Sahil Basumatary',
  alternateNames: ['Sahil Bzy', 'sahilbzy', 'Sahil Basumatary'] as const,
  twitter: '@sahilbzy',
  locale: 'en_US',
} as const;
