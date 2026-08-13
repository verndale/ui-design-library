import type { CardProps } from './Card.types.js';

/** An elevated surface for card layouts. Corner radius is opt-in via `className`. */
export function Card({
  children,
  className,
  classNames,
  unsetBackground = false,
  as: Element = 'div',
  ariaLabel,
  ariaLabelledBy,
}: CardProps) {
  return (
    <Element
      data-component="card"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={['overflow-hidden', unsetBackground ? undefined : 'bg-surface-raised', classNames?.root, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Element>
  );
}
