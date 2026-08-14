import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type BreadcrumbsClassNames = SlotClassNames<
  'root' | 'trail' | 'item' | 'link' | 'label' | 'separator' | 'currentPage' | 'backLink' | 'backIcon'
>;

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export type BreadcrumbsPresentation = 'responsive' | 'trail' | 'back-link';

export type BreadcrumbsProps = {
  /** Ancestor pages, nearest last. The current page is passed separately. */
  items: BreadcrumbItem[];
  /** The current page. Rendered as text, not a link. */
  currentPageTitle: string;
  /** Label for the mobile back link. Defaults to the nearest ancestor's label. */
  backLinkLabel?: string;
  /** Choose the responsive switch, full ordered trail, or nearest-ancestor back link. */
  presentation?: BreadcrumbsPresentation;
  surface?: 'light' | 'dark';
  /** Accessible name for the landmark. Change it when a page has two trails. */
  ariaLabel?: string;
  className?: string;
  /** Separator between items. */
  separator?: ReactNode;
  /** Icon for the mobile back link. */
  backIcon?: ReactNode;
  classNames?: BreadcrumbsClassNames;
};
