# Visual Regression Testing

Visual regression is handled by [Chromatic](https://www.chromatic.com/), which builds
Storybook and captures a snapshot of every story. Snapshots are diffed against an
accepted baseline so unintended visual changes surface in review instead of production.

## How it works

1. `pnpm build-storybook` produces a static Storybook.
2. Chromatic uploads it, renders each story in a Chromium cloud browser, and compares
   the result against the last accepted baseline.
3. Changed stories are flagged for review. Diffs are **advisory** in CI
   (`exitZeroOnChanges`). Baselines are **not** auto-accepted on `main` — accept
   intentional changes in the Chromatic UI when you mean to update the v1.0 look.

Configuration lives in [`chromatic.config.json`](../chromatic.config.json):

| Option              | Value              | Why                                                      |
| ------------------- | ------------------ | -------------------------------------------------------- |
| `storybookBuildDir` | `storybook-static` | Upload a locally built Storybook; avoids rebuild races.  |
| `exitZeroOnChanges` | `true`             | Visual diffs are reported, not treated as CI failures.   |
| `onlyChanged`       | `true`             | TurboSnap only re-snapshots stories touched by a change. |

`pnpm chromatic` runs a clean `pnpm build-storybook` first, then uploads
`storybook-static`. Storybook copies `public/` via `staticDirs` only — Vite’s
`publicDir` copy is disabled so the two do not race on folders like `fonts/`.

## Establishing / updating the baseline

Chromatic needs a project token, stored as the `CHROMATIC_PROJECT_TOKEN` secret in CI and
never committed. To capture or refresh the baseline locally:

```bash
export CHROMATIC_PROJECT_TOKEN=<token from chromatic.com>
pnpm chromatic
```

Then open the Chromatic build and **manually accept** stories that should become the new
baseline. Phase 12 UI states live under the `Phase12/` Storybook group.

## Design tokens

The design system is defined as CSS custom properties in `src/app/globals.css` and rendered
visually by the `Foundations/Design Tokens` story, so token changes are caught by Chromatic.

### Colors

| Token                       | Value     |
| --------------------------- | --------- |
| `--surface-primary`         | `#cccccc` |
| `--surface-elevated`        | `#eeeeee` |
| `--surface-sunken`          | `#999999` |
| `--surface-base`            | `#ffffff` |
| `--color-text`              | `#000000` |
| `--border-highlight`        | `#ffffff` |
| `--border-shadow`           | `#666666` |
| `--border-shadow-deep`      | `#333333` |
| `--window-active-bg`        | `#cccccc` |
| `--window-inactive-bg`      | `#dddddd` |
| `--titlebar-stripe`         | `#999999` |
| `--color-accent`            | `#3366cc` |
| `--color-accent-foreground` | `#ffffff` |

### Spacing

`--spacing-1` `2px`, `--spacing-2` `4px`, `--spacing-3` `8px`, `--spacing-4` `12px`,
`--spacing-5` `16px`, `--spacing-6` `20px`.

### Typography

`--font-system` (Chicago), `--font-body` (Charcoal/Geneva), `--font-mono` (Geneva/Monaco).
