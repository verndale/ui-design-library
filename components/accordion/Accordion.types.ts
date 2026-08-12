import type { ReactNode } from 'react';

export type AccordionItem = {
  /** The visible toggle label. */
  label: ReactNode;
  /** The panel body, revealed when the item is open. */
  children: ReactNode;
  /** Stable key; falls back to the render index. */
  id?: string;
  /** Whether the item starts open. Items open and close independently. */
  defaultOpen?: boolean;
};

export type AccordionProps = {
  items: AccordionItem[];
  /** Optional section heading rendered above the items (an `h2`). */
  heading?: ReactNode;
  /** Boxed treatment — a bordered, rounded, padded container. */
  standalone?: boolean;
  /** Only this many items show until the reveal control is pressed. */
  initialItemCount?: number;
  moreLabel?: string;
  lessLabel?: string;
  className?: string;
};
