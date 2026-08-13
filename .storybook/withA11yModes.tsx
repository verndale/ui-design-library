import type { Decorator } from '@storybook/react-vite';

declare const __A11Y_MODES__: boolean;
const accessibilityModesEnabled = typeof __A11Y_MODES__ !== 'undefined' && __A11Y_MODES__;

export const withA11yModes: Decorator = (Story) => {
  if (!accessibilityModesEnabled) return <Story />;
  return (
    <div data-accessibility-modes="320px forced-colors 200%-text wcag-text-spacing">
      <Story />
    </div>
  );
};
