import type { ReactNode } from 'react';

export type ToastVariant = 'neutral' | 'critical';

export type ToastProps = {
  open: boolean;
  children: ReactNode;
  variant?: ToastVariant;
  dismissMs?: number;
  onDismiss?: () => void;
  className?: string;
};
