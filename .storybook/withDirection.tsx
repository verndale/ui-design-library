import { useEffect } from 'react';
import type { Decorator } from '@storybook/react-vite';

/**
 * Applies the `direction` global to the preview document.
 *
 * Set on `documentElement` rather than a wrapper element on purpose: Modal
 * renders through a portal into `document.body`, so a wrapper around the story
 * would leave the one component with the most layout to get wrong in RTL still
 * rendering LTR.
 *
 * A story that sets its own `dir` still wins for its own subtree, so the
 * Quote RightToLeft story keeps working with the toolbar left on LTR.
 */
export const withDirection: Decorator = function WithDirection(Story, context) {
  const direction = (context.globals.direction as 'ltr' | 'rtl') ?? 'ltr';

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('dir');
    root.setAttribute('dir', direction);
    return () => {
      if (previous === null) root.removeAttribute('dir');
      else root.setAttribute('dir', previous);
    };
  }, [direction]);

  return <Story />;
};
