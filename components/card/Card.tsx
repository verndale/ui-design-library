import type { ReactNode } from 'react';

export type CardProps = {
  children: ReactNode;
  className?: string;
  /** Drop the default surface so a caller's own background applies cleanly. */
  unsetBackground?: boolean;
};

export type CardMediaProps = {
  children: ReactNode;
  /** Aspect, rounding, and width. The wrapper must carry `group` for the zoom. */
  className?: string;
};

/** An elevated surface for card layouts. Corner radius is opt-in via `className`. */
export function Card({ children, className, unsetBackground = false }: CardProps) {
  return (
    <div
      data-component="card"
      className={['overflow-hidden', unsetBackground ? undefined : 'bg-surface-raised', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/**
 * Clipped media slot. The direct child scales on hover **and on keyboard focus**,
 * so the card behaves the same either way — wrap the card in an element with
 * `group` for that to fire. Motion collapses to nothing under reduced motion.
 */
export function CardMedia({ children, className }: CardMediaProps) {
  return (
    <div
      className={[
        'relative shrink-0 overflow-hidden',
        '*:size-full *:object-cover',
        '*:transition-transform *:duration-[var(--duration-base)] *:ease-standard',
        'group-hover:*:scale-[1.05] group-focus-visible:*:scale-[1.05]',
        '*:motion-reduce:transition-none motion-reduce:group-hover:*:scale-100 motion-reduce:group-focus-visible:*:scale-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
