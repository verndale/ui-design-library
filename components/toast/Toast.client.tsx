import { createPortal } from 'react-dom';

import { usePortalRoot } from '../../src/lib/usePortalRoot.client';
import { ToastMessage } from './parts/ToastMessage';
import { useToastDismiss } from './parts/useToastDismiss.client';
import type { ToastProps } from './Toast.types';

/** An SSR-safe, portaled live-region notification with optional auto-dismiss. */
export function Toast({
  open,
  children,
  variant = 'neutral',
  dismissMs = 3000,
  onDismiss,
  className,
}: ToastProps) {
  const portalRoot = usePortalRoot();
  useToastDismiss({ open, dismissMs, onDismiss });
  if (!portalRoot || !open) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-l z-100 flex justify-center px-page-margin">
      <ToastMessage variant={variant} className={className}>{children}</ToastMessage>
    </div>,
    portalRoot,
  );
}
