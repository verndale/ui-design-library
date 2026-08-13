import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type CardClassNames = SlotClassNames<'root'>;

type CardBaseProps = {
  children: ReactNode;
  className?: string;
  /** Drop the default surface so a caller's own background applies cleanly. */
  unsetBackground?: boolean;
  classNames?: CardClassNames;
};

export type CardProps = CardBaseProps &
  (
    | { as?: 'div' | 'article'; ariaLabel?: string; ariaLabelledBy?: string }
    | { as: 'section'; ariaLabel: string; ariaLabelledBy?: never }
    | { as: 'section'; ariaLabel?: never; ariaLabelledBy: string }
  );

export type CardMediaProps = {
  children: ReactNode;
  /** Aspect, rounding, and width. The wrapper must carry `group` for the zoom. */
  className?: string;
};
