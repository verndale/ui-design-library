import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type TabsClassNames = SlotClassNames<'root' | 'list' | 'tab' | 'panels' | 'panel'>;

export type TabItem = {
  id: string;
  label: ReactNode;
  panel: ReactNode;
};

export type TabsPresentation = 'pills' | 'stroke';

type TabsBaseProps = {
  items: TabItem[];
  /** Accessible name for the tablist. */
  ariaLabel: string;
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string) => void;
  tabIdPrefix?: string;
  className?: string;
  classNames?: TabsClassNames;
};

type HorizontalTabsProps = {
  orientation?: 'horizontal';
  /** Horizontal visual treatment. The established pills presentation remains the default. */
  presentation?: TabsPresentation;
};

type VerticalTabsProps = {
  orientation: 'vertical';
  /** Vertical Tabs retain the established pills treatment. */
  presentation?: 'pills';
};

export type TabsProps = TabsBaseProps & (HorizontalTabsProps | VerticalTabsProps);
