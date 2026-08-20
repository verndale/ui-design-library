import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Component API stories live beside their canonical; cross-component examples
  // stay in the separate compositions tree so facade-only imports remain honest.
  stories: ['../components/**/*.stories.@(ts|tsx)', '../stories/compositions/**/*.stories.@(ts|tsx)'],
  addons: [
    // Generates a Docs page per component from its argTypes and TS types.
    '@storybook/addon-docs',
    // Runs axe against the rendered story and reports violations in the panel.
    '@storybook/addon-a11y',
    // Runs every story as a test in a real browser and reports in the sidebar
    // Testing widget. See vitest.config.ts for the pnpm/aria-query workaround.
    '@storybook/addon-vitest',
    // Forces :hover / :focus-visible / :active as static states. Most of this
    // library's behaviour lives in those states, and :focus-visible in
    // particular cannot be inspected by hand — it will not match a click.
    'storybook-addon-pseudo-states',
    // Surfaces each component's `maturity` in the sidebar. See preview.ts.
    'storybook-addon-tag-badges',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
