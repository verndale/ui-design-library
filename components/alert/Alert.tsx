'use client';

import { useEffect, type ReactNode } from 'react';

export type AlertVariant = 'positive' | 'critical';

export type AlertProps = {
  /** The message. */
  children: ReactNode;
  /** Severity — drives the live-region politeness, the icon, and the tone accent. */
  variant?: AlertVariant;
  /** Whether the alert is shown. The consumer owns this state. */
  open?: boolean;
  /** When provided, a dismiss control renders and this is called on press (and on auto-dismiss). */
  onDismiss?: () => void;
  /** Accessible label for the dismiss control. */
  dismissLabel?: string;
  /** Auto-dismiss after this many ms. `0`/omitted keeps it until dismissed. Requires `onDismiss`. */
  dismissMs?: number;
  className?: string;
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

// A critical alert interrupts (assertive); a positive one waits its turn (polite).
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

/**
 * A page-level notification: an icon, a message, and an optional dismiss, on a
 * raised surface with a tone accent.
 *
 * The tone is announced, not just shown: `positive` is a polite `status`,
 * `critical` an assertive `alert`, so a screen reader hears the severity. Kept
 * distinct from Toast (bottom-anchored, transient) on purpose. Auto-dismiss is
 * available but off by default — a page-level message usually persists until
 * the reader acts.
 */
export function Alert({
  children,
  variant = 'positive',
  open = true,
  onDismiss,
  dismissLabel = 'Dismiss',
  dismissMs,
  className,
}: AlertProps) {
  useEffect(() => {
    if (!open || !dismissMs || !onDismiss) return;
    const id = setTimeout(onDismiss, dismissMs);
    return () => clearTimeout(id);
  }, [open, dismissMs, onDismiss]);

  if (!open) return null;
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
      {onDismiss ? (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className={[
            '-mt-2xs -me-2xs inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-pill text-text-primary',
            'transition-colors duration-[var(--duration-fast)] ease-standard hover:bg-surface-sunken',
            focusRing,
          ].join(' ')}
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
