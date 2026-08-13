import type { Decorator } from '@storybook/react-vite';

declare const __A11Y_MODES__: boolean;

export const withA11yModes: Decorator = (Story) => {
  if (!__A11Y_MODES__) return <Story />;
  return (
    <div
      data-accessibility-modes="320px forced-colors 200%-text wcag-text-spacing"
      style={{
        fontSize: '200%',
        letterSpacing: '0.12em',
        lineHeight: 1.5,
        maxWidth: '100%',
        overflowWrap: 'anywhere',
        wordSpacing: '0.16em',
      }}
    >
      <Story />
    </div>
  );
};
