import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Stories live beside the component they document, keyed by canonical slug.
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
