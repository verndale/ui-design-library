import type { InputHTMLAttributes, ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type TextInputVariant = 'default' | 'borderless';

export type TextInputClassNames = SlotClassNames<
  'root' | 'labelRow' | 'label' | 'control' | 'leading' | 'input' | 'trailing' | 'message' | 'helper' | 'error'
>;

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: ReactNode;
  labelSuffix?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  leadingContent?: ReactNode;
  trailingContent?: ReactNode;
  variant?: TextInputVariant;
  inputSize?: number;
  classNames?: TextInputClassNames;
};
