import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type LinkClassNames = SlotClassNames<'root' | 'startIcon' | 'content' | 'endIcon'>;

export type LinkSize = 'large' | 'medium' | 'small';

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
  children: ReactNode;
  className?: string;
  size?: LinkSize;
  /** Render through a router link while keeping this component framework-neutral. */
  as?: ElementType;
  /** Add an invisible minimum-size hit area without growing the layout box. */
  touchTarget?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  classNames?: LinkClassNames;
};
