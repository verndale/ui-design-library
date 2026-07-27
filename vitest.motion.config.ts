import { defineConfig } from 'vitest/config';

import { storybookProject } from './vitest.shared';

/**
 * The motion contract — every duration collapsing to 0ms under
 * `prefers-reduced-motion` — is stated in AGENTS.md and otherwise has no
 * coverage: a broken reduced-motion path renders identically to a working one
 * under the default preference, so nothing catches it.
 *
 * Playwright can emulate the real media query, so the `motion`-tagged stories
 * run again with it set. Those stories branch on `matchMedia` in their play
 * functions, asserting the opposite outcome here.
 *
 * Scoped by tag rather than run over the whole suite: re-running axe against
 * every story to check durations is a poor trade.
 */
export default defineConfig(
  storybookProject({
    name: 'storybook-reduced-motion',
    reducedMotion: 'reduce',
    tags: { include: ['motion'] },
  }),
);
