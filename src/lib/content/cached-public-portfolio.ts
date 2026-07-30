import 'server-only';

import { unstable_cache } from 'next/cache';
import { fetchPublicPortfolioSnapshot } from './public-queries';
import { PORTFOLIO_CACHE_TAG } from './revalidate-portfolio';

const PORTFOLIO_SNAPSHOT_REVALIDATE_SECONDS = 60;

export const fetchCachedPublicPortfolioSnapshot = unstable_cache(
  async () => fetchPublicPortfolioSnapshot(),
  ['public-portfolio-snapshot'],
  {
    revalidate: PORTFOLIO_SNAPSHOT_REVALIDATE_SECONDS,
    tags: [PORTFOLIO_CACHE_TAG],
  }
);
