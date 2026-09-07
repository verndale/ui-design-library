import { forwardRef } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { ToggleProps } from '../Toggle.types.js';

export const ToggleControl = forwardRef<HTMLInputElement, Omit<ToggleProps, 'label' | 'helperText' | 'className'>>(
  function ToggleControl({ classNames, ...props }, ref) {
    return (
      <span className={classes('relative mt-3xs inline-flex shrink-0', classNames?.control)}>
        <input
          {...props}
          ref={ref}
          type="checkbox"
          role="switch"
          className={classes('peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed', classNames?.input)}
        />
        <span
          aria-hidden
          className={classes(
            'relative h-6 w-11 rounded-pill border border-border-strong bg-surface-sunken',
            'transition-colors duration-(--duration-fast) ease-standard motion-reduce:transition-none',
            'peer-checked:border-action-base peer-checked:bg-action-base peer-disabled:border-control-disabled-bg peer-disabled:bg-control-disabled-bg',
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-focus',
            classNames?.track,
          )}
        >
          <span className={classes(
            'absolute left-3xs top-1/2 size-4 -translate-y-1/2 rounded-pill bg-surface-raised shadow-sm',
            'transition-transform duration-(--duration-fast) ease-standard motion-reduce:transition-none',
            'peer-checked:translate-x-5 peer-disabled:bg-control-disabled-text',
            classNames?.thumb,
          )} />
        </span>
      </span>
    );
  },
);
