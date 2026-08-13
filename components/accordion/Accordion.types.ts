import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type AccordionClassNames = SlotClassNames<
  'root' | 'heading' | 'list' | 'item' | 'itemHeading' | 'trigger' | 'label' | 'icon' | 'motion' | 'panel' | 'reveal'
>;
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

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

type AccordionRootSemantics =
  | { role?: 'group'; ariaLabel?: string; ariaLabelledBy?: string }
  | { role: 'region'; ariaLabel: string; ariaLabelledBy?: string }
  | { role: 'region'; ariaLabel?: string; ariaLabelledBy: string };

export type AccordionProps = AccordionRootSemantics & {
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
  classNames?: AccordionClassNames;
  id?: string;
  ariaDescribedBy?: string;
  headingLevel?: AccordionHeadingLevel;
  itemHeadingLevel?: AccordionHeadingLevel;
  collapsedIcon?: ReactNode;
  expandedIcon?: ReactNode;
};
