import type { ReactNode } from 'react';

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export type BreadcrumbsProps = {
  /** Ancestor pages, nearest last. The current page is passed separately. */
  items: BreadcrumbItem[];
  /** The current page. Rendered as text, not a link. */
  currentPageTitle: string;
  /** Label for the mobile back link. Defaults to the nearest ancestor's label. */
  backLinkLabel?: string;
  surface?: 'light' | 'dark';
  /** Accessible name for the landmark. Change it when a page has two trails. */
  ariaLabel?: string;
  className?: string;
  /** Separator between items. */
  separator?: ReactNode;
  /** Icon for the mobile back link. */
  backIcon?: ReactNode;
};
