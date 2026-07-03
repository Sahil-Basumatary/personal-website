# Visual Regression Testing

Visual regression is handled by [Chromatic](https://www.chromatic.com/), which builds
Storybook and captures a snapshot of every story. Snapshots are diffed against an
accepted baseline so unintended visual changes surface in review instead of production.

## How it works

1. `pnpm build-storybook` produces a static Storybook.
2. Chromatic uploads it, renders each story in a Chromium cloud browser, and compares
   the result against the last accepted baseline.
3. Changed stories are flagged for review. On `main`, changes are auto-accepted so the
   baseline always tracks the shipped UI (`autoAcceptChanges` in `chromatic.config.json`).

Configuration lives in [`chromatic.config.json`](../chromatic.config.json):

| Option              | Value             | Why                                                      |
| ------------------- | ----------------- | -------------------------------------------------------- |
| `buildScriptName`   | `build-storybook` | Reuses the existing Storybook build script.              |
| `exitZeroOnChanges` | `true`            | Visual diffs are reported, not treated as CI failures.   |
| `autoAcceptChanges` | `main`            | The `main` branch defines the accepted baseline.         |
| `onlyChanged`       | `true`            | TurboSnap only re-snapshots stories touched by a change. |

## Establishing the baseline

Chromatic needs a project token, stored as the `CHROMATIC_PROJECT_TOKEN` secret in CI and
never committed. To capture the first baseline locally:

```bash
export CHROMATIC_PROJECT_TOKEN=<token from chromatic.com>
pnpm chromatic
```

The initial run accepts every story as the baseline. Subsequent runs diff against it.

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
