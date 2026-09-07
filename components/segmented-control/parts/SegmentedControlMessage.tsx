import type { ReactNode } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { SegmentedControlClassNames } from '../SegmentedControl.types.js';

export function SegmentedControlMessage({ helperId, errorId, helperText, error, errorMessage, classNames }: {
  helperId: string;
  errorId: string;
  helperText?: ReactNode;
  error: boolean;
  errorMessage?: ReactNode;
  classNames?: SegmentedControlClassNames;
}) {
  if (error && errorMessage) {
    return <p id={errorId} role="alert" className={classes('text-sm text-tone-critical', classNames?.error)}>{errorMessage}</p>;
  }
  return helperText ? <p id={helperId} className={classes('text-sm text-text-secondary', classNames?.helper)}>{helperText}</p> : null;
}
