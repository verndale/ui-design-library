import type { ReactNode } from 'react';

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
};
