import type { InputHTMLAttributes, ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type ToggleClassNames = SlotClassNames<'root' | 'control' | 'input' | 'track' | 'thumb' | 'content' | 'label' | 'helper'>;

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: ReactNode;
  helperText?: ReactNode;
  classNames?: ToggleClassNames;
};
