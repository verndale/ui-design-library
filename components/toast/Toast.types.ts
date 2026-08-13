import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type ToastClassNames = SlotClassNames<'portal' | 'root' | 'icon' | 'message'>;
export type ToastPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export type ToastVariant = 'neutral' | 'critical';

export type ToastProps = {
  open: boolean;
  children: ReactNode;
  variant?: ToastVariant;
  dismissMs?: number;
  onDismiss?: () => void;
  className?: string;
  classNames?: ToastClassNames;
  /** `undefined` keeps the tone icon; `null` omits it. */
  icon?: ReactNode | null;
  position?: ToastPosition;
};
