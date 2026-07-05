import { SITE, SITE_URL } from '@/lib/site';

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// Person + WebSite graph, interlinked by @id so search engines resolve the site
// to a single owning entity. Data-only; safe to inline without a script nonce.
export function buildStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: SITE.author,
        url: SITE_URL,
        sameAs: [
          'https://github.com/Sahil-Basumatary',
          'https://blog.sahilbzy.com',
          'https://x.com/sahilbzy',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en',
        publisher: { '@id': PERSON_ID },
      },
    ],
  };
}

// Escapes the closing-tag sequence so the payload can't break out of <script>.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
