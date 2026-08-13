'use client';

import { useEffect } from 'react';

import type { DismissibleAlertProps } from '../Alert.types.js';
import { AlertFrame } from './AlertFrame.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function DismissibleAlert({
  children,
  variant = 'positive',
  open = true,
  className,
  onDismiss,
  dismissLabel = 'Dismiss',
  dismissMs,
  classNames,
  icon,
  showAccent,
}: DismissibleAlertProps) {
  useEffect(() => {
    if (!open || !dismissMs) return;
    const id = setTimeout(onDismiss, dismissMs);
    return () => clearTimeout(id);
  }, [open, dismissMs, onDismiss]);

  if (!open) return null;

  const action = (
    <button
      type="button"
      aria-label={dismissLabel}
      onClick={onDismiss}
      className={[
        '-mt-2xs -me-2xs inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-pill text-text-primary',
        'transition-colors duration-(--duration-fast) ease-standard hover:bg-surface-sunken',
        focusRing,
        classNames?.dismiss,
      ].filter(Boolean).join(' ')}
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
      </svg>
    </button>
  );

  return (
    <AlertFrame variant={variant} className={className} classNames={classNames} icon={icon} showAccent={showAccent} action={action}>
      {children}
    </AlertFrame>
  );
}
