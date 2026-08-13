/**
 * The dismiss control shared by overlay components — a pill icon button with the
 * inverse surface treatment, a hover transition that collapses under reduced
 * motion, and a visible focus ring. The close glyph is inline and `aria-hidden`;
 * the button's `label` carries the accessible name.
 *
 * Extracted so Modal and Search overlay (and any future overlay) share one close
 * control rather than each re-declaring the same markup and token bindings.
 */
export function CloseButton({
  label,
  onClick,
  className,
  icon,
  iconClassName,
}: {
  /** Accessible name for the control. */
  label: string;
  onClick: () => void;
  /** Positioning utilities from the consumer, e.g. absolute placement. */
  className?: string;
  icon?: ReactNode;
  iconClassName?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill',
        'bg-surface-inverse text-text-inverse',
        'transition-colors duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none',
        'hover:bg-action-hover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden className={['inline-flex size-4', iconClassName].filter(Boolean).join(' ')}>
        {icon ?? (
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
import type { ReactNode } from 'react';
