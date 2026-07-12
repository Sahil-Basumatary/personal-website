import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { BUNDLED_PORTFOLIO } from './bundled-portfolio';
import { loadPortfolioWithDeps } from './portfolio-loader';
import { fetchPublicPortfolioSnapshot } from './public-queries';

export type {
  PortfolioLoadResult,
  PortfolioLoadSource,
} from './portfolio-loader';

export async function loadPortfolioContent() {
  return loadPortfolioWithDeps({
    fetchSnapshot: fetchPublicPortfolioSnapshot,
    reportError: (error) => {
      Sentry.captureException(error, {
        tags: { scope: 'portfolio-loader' },
      });
    },
    fallback: BUNDLED_PORTFOLIO,
  });
}
