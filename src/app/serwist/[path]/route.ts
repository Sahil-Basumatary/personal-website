import { spawnSync } from 'node:child_process';
import { createSerwistRoute } from '@serwist/turbopack';

// Versions the precached offline shell so a new deploy invalidates stale copies.
// Git is the natural source of truth, but this repo's git is flaky (iCloud), so
// fall back to a random id if the command yields nothing.
const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf-8',
  }).stdout?.trim() || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: '/~offline', revision }],
    swSrc: 'src/app/sw.ts',
    useNativeEsbuild: true,
  });
