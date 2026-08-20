import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';
import type { InPageNavigationItem } from '../in-page-navigation/index.js';

export type InPageNavigationModalDrawerClassNames = SlotClassNames<
  | 'root'
  | 'desktopList'
  | 'item'
  | 'link'
  | 'mobile'
  | 'trigger'
  | 'label'
  | 'icon'
  | 'backdrop'
  | 'viewport'
  | 'dialog'
  | 'header'
  | 'title'
  | 'closeButton'
  | 'panel'
  | 'swipeHandle'
  | 'mobileList'
>;

export type InPageNavigationModalDrawerItem = InPageNavigationItem;

export type InPageNavigationModalDrawerProps = {
  items: InPageNavigationModalDrawerItem[];
  /** Accessible name for both navigation landmarks and the dialog. */
  ariaLabel?: string;
  /** Accessible name for the dialog close button. */
  closeLabel?: string;
  /** Active section id (controlled). Omit to let scroll position drive it. */
  activeId?: string;
  className?: string;
  classNames?: InPageNavigationModalDrawerClassNames;
  collapsedIcon?: ReactNode;
  expandedIcon?: ReactNode;
};
