import type { ReactNode } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { TextInputClassNames } from '../TextInput.types.js';

export function TextInputLabel({
  inputId,
  label,
  suffix,
  classNames,
}: {
  inputId: string;
  label?: ReactNode;
  suffix?: ReactNode;
  classNames?: TextInputClassNames;
}) {
  if (!label) return null;
  return (
    <div className={classes('flex items-center gap-2xs', classNames?.labelRow)}>
      <label htmlFor={inputId} className={classes('text-sm font-medium text-text-primary', classNames?.label)}>
        {label}
      </label>
      {suffix}
    </div>
  );
}
