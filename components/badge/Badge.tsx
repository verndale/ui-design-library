'use client';

import type { ReactNode } from 'react';

export type BadgeSurface = 'light' | 'dark';

export type BadgeProps = {
  /** The badge text. Kept a string so the dismiss label can be derived from it. */
  label: string;
  /** Supplying this makes the badge dismissible. */
  onRemove?: () => void;
  /** Defaults to `Remove ${label}`. Override when the label alone reads oddly. */
  removeLabel?: string;
  disabled?: boolean;
  surface?: BadgeSurface;
  className?: string;
  /** Decorative leading icon. */
  startIcon?: ReactNode;
};

function DismissIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A short label, optionally dismissible — the filter-chip case as well as the
 * plain status tag. When `onRemove` is supplied the dismiss control is a real
 * button with its own accessible name, so the badge stays operable by keyboard.
 */
export function Badge({
  label,
  onRemove,
  removeLabel,
  disabled = false,
  surface = 'light',
  className,
  startIcon,
}: BadgeProps) {
  const inverse = surface === 'dark';

  return (
    <span
      data-component="badge"
      data-surface={surface}
      className={[
        'inline-flex items-center gap-3xs rounded-pill border border-solid px-2xs py-3xs text-sm leading-none',
        inverse ? 'border-text-inverse text-text-inverse' : 'border-border-strong text-text-primary',
        disabled ? 'opacity-40' : undefined,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {startIcon ? (
        <span aria-hidden className="inline-flex shrink-0 [&_svg]:size-4">
          {startIcon}
        </span>
      ) : null}
      <span>{label}</span>
      {onRemove ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={removeLabel ?? `Remove ${label}`}
          onClick={onRemove}
          className={[
            'ms-3xs inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-pill',
            'transition-opacity duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none',
            'hover:opacity-70 disabled:pointer-events-none',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          ].join(' ')}
        >
          <DismissIcon />
        </button>
      ) : null}
    </span>
  );
}
