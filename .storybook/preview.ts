import type { Preview } from '@storybook/react-vite';

import '../src/tokens/index.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    // Accessibility findings are the point of having this library, so surface
    // them as failures in the panel rather than passive notes.
    a11y: { test: 'error' },
  },
};

export default preview;
