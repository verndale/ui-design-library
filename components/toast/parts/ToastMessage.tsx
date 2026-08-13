import type { ReactNode } from 'react';

import { ToastIcon } from './ToastIcon';
import type { ToastVariant } from '../Toast.types';

const tone = {
  neutral: { role: 'status', live: 'polite', accent: 'text-text-primary' },
  critical: { role: 'alert', live: 'assertive', accent: 'text-tone-critical' },
} as const;

/** Visual toast surface and severity-specific live-region contract. */
export function ToastMessage({
  children,
  variant,
  className,
}: {
  children: ReactNode;
  variant: ToastVariant;
  className?: string;
}) {
  const semantics = tone[variant];
  return (
    <div
      role={semantics.role}
      aria-live={semantics.live}
      data-component="toast"
      className={[
        'pointer-events-auto flex max-w-md items-center gap-2xs rounded-medium border border-border-subtle',
        'bg-surface-raised px-s py-2xs text-text-primary shadow-overlay animate-fade-in',
        className,
      ].filter(Boolean).join(' ')}
    >
      <span aria-hidden className={['inline-flex shrink-0', semantics.accent].join(' ')}>
        <ToastIcon variant={variant} />
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
