import type { CardProps } from './Card.types.js';

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
