import type { ReactNode } from 'react';

export type BadgeSurface = 'light' | 'dark';

export type BadgeProps = {
  /** The badge text. */
  label: string;
  disabled?: boolean;
  surface?: BadgeSurface;
  className?: string;
  /** Decorative leading icon. */
  startIcon?: ReactNode;
};

export type DismissibleBadgeProps = BadgeProps & {
  onRemove: () => void;
  /** Defaults to `Remove ${label}`. Override when the label alone reads oddly. */
  removeLabel?: string;
};
