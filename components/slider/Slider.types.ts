import type { ReactNode } from 'react';

export type SliderOption = {
  value: string;
  label: string;
  description?: ReactNode;
};

export type SliderProps = {
  /** The control's visible label. */
  label: ReactNode;
  /** The discrete scale, in order. */
  options: SliderOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option: SliderOption) => void;
  hint?: ReactNode;
  /** Unit appended to the announced and displayed value. */
  unit?: string;
  className?: string;
};
