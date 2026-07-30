import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { BUNDLED_PORTFOLIO } from './bundled-portfolio';
import { fetchCachedPublicPortfolioSnapshot } from './cached-public-portfolio';
import { loadPortfolioWithDeps } from './portfolio-loader';

export type {
  PortfolioLoadResult,
  PortfolioLoadSource,
} from './portfolio-loader';

export async function loadPortfolioContent() {
  return loadPortfolioWithDeps({
    fetchSnapshot: fetchCachedPublicPortfolioSnapshot,
    reportError: (error) => {
      Sentry.captureException(error, {
        tags: { scope: 'portfolio-loader' },
      });
    },
    fallback: BUNDLED_PORTFOLIO,
  });
}
