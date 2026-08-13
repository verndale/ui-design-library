import type { ReactNode } from 'react';

import type { AlertVariant } from '../Alert.types';

const TONE = {
  positive: { role: 'status', live: 'polite', accent: 'text-tone-positive', bar: 'bg-tone-positive' },
  critical: { role: 'alert', live: 'assertive', accent: 'text-tone-critical', bar: 'bg-tone-critical' },
} as const;

function ToneIcon({ variant }: { variant: AlertVariant }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      {variant === 'positive' ? (
        <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M8 4v4.5" strokeLinecap="round" />
          <path d="M8 11.5h.01" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function AlertFrame({
  children,
  variant,
  className,
  action,
}: {
  children: ReactNode;
  variant: AlertVariant;
  className?: string;
  action?: ReactNode;
}) {
  const tone = TONE[variant];

  return (
    <div
      role={tone.role}
      aria-live={tone.live}
      data-component="alert"
      className={[
        'flex w-full items-start gap-s rounded-medium border border-border-subtle bg-surface-raised p-m text-text-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden className={['w-1 shrink-0 self-stretch rounded-pill', tone.bar].join(' ')} />
      <span aria-hidden className={['inline-flex shrink-0', tone.accent].join(' ')}>
        <ToneIcon variant={variant} />
      </span>
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      {action}
    </div>
  );
}
