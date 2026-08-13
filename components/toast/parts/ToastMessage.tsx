import type { ReactNode } from 'react';

import { ToastIcon } from './ToastIcon.js';
import type { ToastClassNames, ToastVariant } from '../Toast.types.js';

const tone = {
  neutral: { role: 'status', live: 'polite', accent: 'text-text-primary' },
  critical: { role: 'alert', live: 'assertive', accent: 'text-tone-critical' },
} as const;

/** Visual toast surface and severity-specific live-region contract. */
export function ToastMessage({
  children,
  variant,
  className,
  classNames,
  icon,
}: {
  children: ReactNode;
  variant: ToastVariant;
  className?: string;
  classNames?: ToastClassNames;
  icon?: ReactNode | null;
}) {
  const semantics = tone[variant];
  return (
    <div
      role={semantics.role}
      aria-live={semantics.live}
      aria-atomic="true"
      data-component="toast"
      className={[
        'pointer-events-auto flex max-w-md items-center gap-2xs rounded-medium border border-border-subtle',
        'bg-surface-raised px-s py-2xs text-text-primary shadow-overlay animate-fade-in',
        classNames?.root,
        className,
      ].filter(Boolean).join(' ')}
    >
      {icon !== null ? <span aria-hidden className={['inline-flex shrink-0', semantics.accent, classNames?.icon].filter(Boolean).join(' ')}>
        {icon ?? <ToastIcon variant={variant} />}
      </span> : null}
      <span className={['text-sm', classNames?.message].filter(Boolean).join(' ')}>{children}</span>
    </div>
  );
}
