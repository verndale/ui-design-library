import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type DatepickerClassNames = SlotClassNames<
  'root' | 'fields' | 'field' | 'trigger' | 'popover' | 'calendar' | 'header' | 'grid' | 'day' | 'message'
>;

type CommonProps = {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  classNames?: DatepickerClassNames;
};

export type DatepickerSingleProps = CommonProps & {
  mode?: 'single';
  value: Date | null;
  onChange: (value: Date | null) => void;
  name?: string;
};

export type DatepickerRange = { start: Date | null; end: Date | null };

export type DatepickerRangeProps = CommonProps & {
  mode: 'range';
  variant?: 'default' | 'compact';
  value: DatepickerRange;
  onChange: (value: DatepickerRange) => void;
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  startName?: string;
  endName?: string;
};

export type DatepickerProps = DatepickerSingleProps | DatepickerRangeProps;
