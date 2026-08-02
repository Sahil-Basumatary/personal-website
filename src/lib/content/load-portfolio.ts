import 'server-only';

import { BUNDLED_PORTFOLIO } from './bundled-portfolio';
import { fetchCachedPublicPortfolioSnapshot } from './cached-public-portfolio';
import { loadPortfolioWithDeps } from './portfolio-loader';
import { reportServerError } from '@/lib/observability/report-server-error';

export type {
  PortfolioLoadResult,
  PortfolioLoadSource,
} from './portfolio-loader';

export async function loadPortfolioContent() {
  return loadPortfolioWithDeps({
    fetchSnapshot: fetchCachedPublicPortfolioSnapshot,
    reportError: (error) => {
      reportServerError(error, { scope: 'portfolio-loader' });
    },
    fallback: BUNDLED_PORTFOLIO,
  });
}
