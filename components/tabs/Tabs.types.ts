import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type TabsClassNames = SlotClassNames<'root' | 'tab'>;

export type TabItem = {
  id: string;
  label: ReactNode;
};

export type TabsProps = {
  items: TabItem[];
  /** Accessible name for the tablist. */
  ariaLabel: string;
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string) => void;
  tabIdPrefix?: string;
  className?: string;
  classNames?: TabsClassNames;
  orientation?: 'horizontal' | 'vertical';
};
