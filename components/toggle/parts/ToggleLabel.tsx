import type { ReactNode } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { ToggleClassNames } from '../Toggle.types.js';

export function ToggleLabel({ inputId, helperId, label, helperText, classNames }: {
  inputId: string;
  helperId: string;
  label?: ReactNode;
  helperText?: ReactNode;
  classNames?: ToggleClassNames;
}) {
  if (!label && !helperText) return null;
  return (
    <span className={classes('grid min-w-0 gap-3xs', classNames?.content)}>
      {label ? <label htmlFor={inputId} className={classes('cursor-pointer text-base font-medium text-text-primary', classNames?.label)}>{label}</label> : null}
      {helperText ? <span id={helperId} className={classes('text-sm text-text-secondary', classNames?.helper)}>{helperText}</span> : null}
    </span>
  );
}
