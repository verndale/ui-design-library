import type { ReactNode } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { TextInputClassNames } from '../TextInput.types.js';

export function TextInputMessage({
  helperId,
  errorId,
  helperText,
  error,
  errorMessage,
  classNames,
}: {
  helperId: string;
  errorId: string;
  helperText?: ReactNode;
  error: boolean;
  errorMessage?: ReactNode;
  classNames?: TextInputClassNames;
}) {
  if (error && errorMessage) {
    return <p id={errorId} role="alert" className={classes('text-sm text-tone-critical', classNames?.message, classNames?.error)}>{errorMessage}</p>;
  }
  if (helperText) {
    return <p id={helperId} className={classes('text-sm text-text-secondary', classNames?.message, classNames?.helper)}>{helperText}</p>;
  }
  return null;
}
