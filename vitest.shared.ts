import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import tailwindcss from '@tailwindcss/vite';

/**
 * Shared definition for a browser project that runs the Storybook stories.
 *
 * Lives in its own module because the two configs must run as **separate Vitest
 * invocations**, not two projects in one. The storybookTest plugin caches its
 * generated setup under a path derived from `configDir`, so two projects sharing
 * a configDir race on it and every story file fails to import.
 *
 * Tailwind has to be re-declared here: these configs replace vite.config.ts for
 * the test run rather than extending it, and without it `@import 'tailwindcss'`
 * never compiles. Every story then renders unstyled, which silently invalidates
 * any computed-style or contrast assertion while still reporting green.
 *
 * `storybook/test` is pre-bundled because it pulls in @testing-library/dom,
 * which depends on the CJS aria-query. Left un-optimized that is served raw and
 * fails as ESM ("does not provide an export named 'elementRoles'"). aria-query
 * cannot be named directly — pnpm's isolated node_modules makes it unresolvable
 * from the project root, so naming it in `include` silently does nothing.
 * `storybook/viewport` is also explicit: on a clean dependency cache Vite used
 * to discover it mid-run, reload the browser, and detach half the story files
 * from Vitest's active suite.
 */
export const storybookProject = ({
  name,
  reducedMotion,
  tags,
  browser = 'chromium',
  a11yModes = false,
}: {
  name: string;
  reducedMotion: 'reduce' | 'no-preference';
  tags?: { include?: string[]; exclude?: string[] };
  browser?: 'chromium' | 'webkit';
  a11yModes?: boolean;
}) => ({
  plugins: [tailwindcss(), storybookTest({ configDir: '.storybook', tags })],
  define: { __A11Y_MODES__: JSON.stringify(a11yModes) },
  optimizeDeps: { include: ['storybook/test', 'storybook/viewport'] },
  test: {
    name,
    setupFiles: ['.storybook/a11y-modes.setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        contextOptions: {
          reducedMotion,
          ...(a11yModes ? { forcedColors: 'active' as const, viewport: { width: 320, height: 900 } } : {}),
        },
      }),
      instances: [{ browser }],
    },
  },
});
