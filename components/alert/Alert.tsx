import type { AlertProps } from './Alert.types';
import { AlertFrame } from './parts/AlertFrame';

export type { AlertProps, AlertVariant, DismissibleAlertProps } from './Alert.types';

/** A server-safe page-level notification with severity announced by its live region. */
export function Alert({ children, variant = 'positive', open = true, className }: AlertProps) {
  if (!open) return null;

  return (
    <AlertFrame variant={variant} className={className}>
      {children}
    </AlertFrame>
  );
}
