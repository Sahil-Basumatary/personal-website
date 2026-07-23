import { describe, it, expect } from 'vitest';
import { buildStructuredData, serializeJsonLd } from './structured-data';

describe('buildStructuredData', () => {
  it('exposes Sahil Bzy alternate names for search discoverability', () => {
    const data = buildStructuredData();
    const graph = data['@graph'] as Array<Record<string, unknown>>;
    const person = graph.find((node) => node['@type'] === 'Person');
    const website = graph.find((node) => node['@type'] === 'WebSite');

    expect(person?.alternateName).toEqual(
      expect.arrayContaining(['Sahil Bzy', 'sahilbzy'])
    );
    expect(website?.alternateName).toEqual(
      expect.arrayContaining(['Sahil Bzy', 'sahilbzy.com'])
    );
  });

  it('escapes script breakouts in JSON-LD', () => {
    expect(serializeJsonLd({ html: '</script>' })).toContain('\\u003c/script>');
  });
});
