import type { PortfolioContent } from '@/types/portfolio';
import {
  mapPortfolioContent,
  type ProjectRecord,
  type SkillRecord,
} from './map-portfolio';

export type PortfolioLoadSource = 'database' | 'fallback';

export interface PortfolioLoadResult {
  content: PortfolioContent;
  source: PortfolioLoadSource;
}

export type PortfolioSnapshot = {
  about: string | null;
  projects: readonly ProjectRecord[];
  skills: readonly SkillRecord[];
};

export function resolvePortfolioLoad(
  input:
    | ({ ok: true } & PortfolioSnapshot & { fallback: PortfolioContent })
    | { ok: false; fallback: PortfolioContent }
): PortfolioLoadResult {
  if (!input.ok) {
    return {
      content: input.fallback,
      source: 'fallback',
    };
  }

  return {
    content: mapPortfolioContent({
      about: input.about,
      projects: input.projects,
      skills: input.skills,
    }),
    source: 'database',
  };
}

export async function loadPortfolioWithDeps(deps: {
  fetchSnapshot: () => Promise<PortfolioSnapshot>;
  reportError: (error: unknown) => void;
  fallback: PortfolioContent;
}): Promise<PortfolioLoadResult> {
  try {
    const snapshot = await deps.fetchSnapshot();
    return resolvePortfolioLoad({
      ok: true,
      ...snapshot,
      fallback: deps.fallback,
    });
  } catch (error) {
    deps.reportError(error);
    return resolvePortfolioLoad({
      ok: false,
      fallback: deps.fallback,
    });
  }
}
