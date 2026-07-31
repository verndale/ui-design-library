'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'neutral' | 'critical';

export type ToastProps = {
  /** Whether the toast is shown. The consumer owns this state. */
  open: boolean;
  /** The message. */
  children: ReactNode;
  /** Severity — drives the live-region politeness and the icon tone. */
  variant?: ToastVariant;
  /** Auto-dismiss after this many ms. `0` keeps it up. Requires `onDismiss`. */
  dismissMs?: number;
  /** Called when the auto-dismiss timer elapses. */
  onDismiss?: () => void;
  className?: string;
};

// A critical toast interrupts (assertive alert); a neutral one waits (polite status).
const TONE = {
  neutral: { role: 'status', live: 'polite', accent: 'text-text-primary' },
  critical: { role: 'alert', live: 'assertive', accent: 'text-tone-critical' },
} as const;

function ToastIcon({ variant }: { variant: ToastVariant }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      {variant === 'critical' ? (
        <>
          <path d="M8 4v4.5" strokeLinecap="round" />
          <path d="M8 11.5h.01" strokeLinecap="round" />
        </>
      ) : (
        <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/**
 * A transient, bottom-anchored confirmation.
 *
 * The live-region semantics are the point, not the sliding: a `neutral` toast is
 * a polite `status`, a `critical` one an assertive `alert`, so the severity is
 * announced. It portals to the document body so it stacks above page content,
 * auto-dismisses on a timer, and its entrance collapses under
 * `prefers-reduced-motion` through the duration token. Kept distinct from Alert,
 * which is page-level and persistent.
 */
export function Toast({ open, children, variant = 'neutral', dismissMs = 3000, onDismiss, className }: ToastProps) {
  // Portals need a DOM target, which does not exist during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !dismissMs || !onDismiss) return;
    const id = setTimeout(onDismiss, dismissMs);
    return () => clearTimeout(id);
  }, [open, dismissMs, onDismiss]);

  if (!mounted || !open) return null;
  const tone = TONE[variant];

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-l z-100 flex justify-center px-page-margin">
      <div
        role={tone.role}
        aria-live={tone.live}
        data-component="toast"
        className={[
          'pointer-events-auto flex max-w-md items-center gap-2xs rounded-medium border border-border-subtle',
          'bg-surface-raised px-s py-2xs text-text-primary shadow-overlay animate-fade-in',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span aria-hidden className={['inline-flex shrink-0', tone.accent].join(' ')}>
          <ToastIcon variant={variant} />
        </span>
        <span className="text-sm">{children}</span>
      </div>
    </div>,
    document.body,
  );
}
