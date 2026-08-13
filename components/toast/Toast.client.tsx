import { createPortal } from 'react-dom';

import { usePortalRoot } from '../../src/lib/usePortalRoot.client.js';
import { ToastMessage } from './parts/ToastMessage.js';
import { useToastDismiss } from './parts/useToastDismiss.client.js';
import type { ToastProps } from './Toast.types.js';

const positions = {
  'top-start': 'inset-x-0 top-l justify-start',
  'top-center': 'inset-x-0 top-l justify-center',
  'top-end': 'inset-x-0 top-l justify-end',
  'bottom-start': 'inset-x-0 bottom-l justify-start',
  'bottom-center': 'inset-x-0 bottom-l justify-center',
  'bottom-end': 'inset-x-0 bottom-l justify-end',
} as const;

/** An SSR-safe, portaled live-region notification with optional auto-dismiss. */
export function Toast({
  open,
  children,
  variant = 'neutral',
  dismissMs = 3000,
  onDismiss,
  className,
  classNames,
  icon,
  position = 'bottom-center',
}: ToastProps) {
  const portalRoot = usePortalRoot();
  useToastDismiss({ open, dismissMs, onDismiss });
  if (!portalRoot || !open) return null;

  return createPortal(
    <div className={['pointer-events-none fixed z-100 flex px-page-margin', positions[position], classNames?.portal].filter(Boolean).join(' ')}>
      <ToastMessage variant={variant} icon={icon} className={className} classNames={classNames}>{children}</ToastMessage>
    </div>,
    portalRoot,
  );
}
