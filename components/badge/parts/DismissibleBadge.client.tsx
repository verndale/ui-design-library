'use client';

import type { DismissibleBadgeProps } from '../Badge.types.js';
import { BadgeFrame } from './BadgeFrame.js';

function DismissIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DismissibleBadge({ onRemove, removeLabel, ...badge }: DismissibleBadgeProps) {
  const action = (
    <button
      type="button"
      disabled={badge.disabled}
      aria-label={removeLabel ?? `Remove ${badge.label}`}
      onClick={onRemove}
      className={[
        'ms-3xs inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-pill',
        'transition-opacity duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none',
        'hover:opacity-70 disabled:pointer-events-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        badge.classNames?.removeButton,
      ].join(' ')}
    >
      <DismissIcon />
    </button>
  );

  return <BadgeFrame {...badge} action={action} />;
}
