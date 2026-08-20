import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type TabsNativeSelectItem = {
  id: string;
  /** Plain text is required because native option content cannot contain arbitrary nodes. */
  label: string;
  panel: ReactNode;
};

export type TabsNativeSelectClassNames = SlotClassNames<
  'root' | 'desktop' | 'list' | 'tab' | 'mobile' | 'selectLabel' | 'select' | 'panels' | 'panel'
>;

export type TabsNativeSelectProps = {
  items: TabsNativeSelectItem[];
  /** Accessible name shared by the group, tablist, and native select. */
  ariaLabel: string;
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string) => void;
  tabIdPrefix?: string;
  className?: string;
  classNames?: TabsNativeSelectClassNames;
};
