import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type BadgeClassNames = SlotClassNames<'root' | 'startIcon' | 'label' | 'endIcon' | 'removeButton'>;

export type BadgeSurface = 'light' | 'dark';

export type BadgeProps = {
  /** The badge text. */
  label: string;
  disabled?: boolean;
  surface?: BadgeSurface;
  className?: string;
  /** Decorative leading icon. */
  startIcon?: ReactNode;
  /** Decorative trailing icon. */
  endIcon?: ReactNode;
  classNames?: BadgeClassNames;
  /** Adds the keyboard-operable remove control when supplied. */
  onRemove?: () => void;
  /** Accessible name for the optional remove control. */
  removeLabel?: string;
};

export type DismissibleBadgeProps = BadgeProps & { onRemove: () => void };
