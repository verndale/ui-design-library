import { forwardRef, useId } from 'react';

import { classes } from '../../src/lib/classNames.js';
import { ToggleControl } from './parts/ToggleControl.js';
import { ToggleLabel } from './parts/ToggleLabel.js';
import type { ToggleProps } from './Toggle.types.js';

/** A native checkbox presented as a binary on/off setting. */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { id: suppliedId, label, helperText, className, classNames, 'aria-label': ariaLabel, 'aria-describedby': describedBy, ...inputProps },
  ref,
) {
  const reactId = useId();
  const inputId = suppliedId ?? `toggle-${reactId}`;
  const helperId = `${inputId}-helper`;

  return (
    <div data-component="toggle" className={classes('inline-flex min-w-0 items-start gap-s', classNames?.root, className)}>
      <ToggleControl
        {...inputProps}
        ref={ref}
        id={inputId}
        aria-label={ariaLabel}
        aria-describedby={classes(describedBy, helperText ? helperId : undefined)}
        classNames={classNames}
      />
      <ToggleLabel inputId={inputId} helperId={helperId} label={label} helperText={helperText} classNames={classNames} />
    </div>
  );
});
