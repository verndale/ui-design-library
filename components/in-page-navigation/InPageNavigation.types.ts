import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type InPageNavigationClassNames = SlotClassNames<
  'root' | 'desktopList' | 'item' | 'link' | 'mobile' | 'trigger' | 'label' | 'icon' | 'motion' | 'panel' | 'mobileList'
>;

export type InPageNavigationItem = {
  /** The DOM `id` of the section this item jumps to. */
  id: string;
  label: ReactNode;
};

export type InPageNavigationProps = {
  items: InPageNavigationItem[];
  /** Accessible name for the landmark. Defaults to "On this page". */
  ariaLabel?: string;
  /** Active section id (controlled). Omit to let scroll position drive it. */
  activeId?: string;
  className?: string;
  classNames?: InPageNavigationClassNames;
  collapsedIcon?: ReactNode;
  expandedIcon?: ReactNode;
};
