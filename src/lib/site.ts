const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sahilbzy.com';

// Normalized origin (no trailing slash) used as the single source of truth for
// canonical URLs, Open Graph tags, the sitemap, and JSON-LD across the app.
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const SITE = {
  name: "Sahil's Computer",
  shortName: "Sahil's PC",
  description:
    "Sahil Basumatary's personal portfolio, reimagined as a Mac OS 9 desktop — explore projects, skills, and writing through an interactive interface.",
  author: 'Sahil Basumatary',
  twitter: '@sahilbzy',
  locale: 'en_US',
} as const;
