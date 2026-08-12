import type { ReactNode } from 'react';

export type CardProps = {
  children: ReactNode;
  className?: string;
  /** Drop the default surface so a caller's own background applies cleanly. */
  unsetBackground?: boolean;
};

export type CardMediaProps = {
  children: ReactNode;
  /** Aspect, rounding, and width. The wrapper must carry `group` for the zoom. */
  className?: string;
};
