import { defineConfig } from 'vitest/config';

import { storybookProject } from './vitest.shared';

// WebKit is a Safari-engine regression proxy. It is not a substitute for a
// human VoiceOver session in the complete consuming page.
export default defineConfig(
  storybookProject({
    name: 'storybook-webkit',
    browser: 'webkit',
    reducedMotion: 'no-preference',
  }),
);
