import { defineConfig } from 'vitest/config';

import { storybookProject } from './vitest.shared';

// Re-run the real stories in a 320 CSS-pixel viewport, forced colors, 200%
// text, and WCAG text-spacing overrides. Existing play functions and axe run
// against the adapted render, catching clipped labels and unreachable controls.
export default defineConfig(
  storybookProject({
    name: 'storybook-accessibility-modes',
    reducedMotion: 'no-preference',
    a11yModes: true,
  }),
);
