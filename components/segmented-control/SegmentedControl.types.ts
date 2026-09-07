import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type SegmentedControlClassNames = SlotClassNames<
  'root' | 'legend' | 'group' | 'option' | 'input' | 'segment' | 'helper' | 'error'
>;

export type SegmentedControlOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  legend: ReactNode;
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option: SegmentedControlOption) => void;
  name?: string;
  disabled?: boolean;
  hideLegend?: boolean;
  helperText?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  className?: string;
  classNames?: SegmentedControlClassNames;
};
