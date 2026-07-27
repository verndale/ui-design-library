import { defineConfig } from 'vitest/config';

import { storybookProject } from './vitest.shared';

// Every story, under the default motion preference.
export default defineConfig(
  storybookProject({ name: 'storybook', reducedMotion: 'no-preference' }),
);
