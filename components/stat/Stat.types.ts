import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type StatClassNames = SlotClassNames<'root' | 'value' | 'label' | 'description'>;
export type StatGroupClassNames = SlotClassNames<'root' | 'heading' | 'list' | 'item'>;

export type StatProps = {
  value: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  classNames?: StatClassNames;
  contentOrder?: 'value-first' | 'label-first';
};

export type StatGroupProps = {
  heading: string;
  orientation?: 'row' | 'column';
  children: ReactNode;
  className?: string;
  classNames?: StatGroupClassNames;
};
