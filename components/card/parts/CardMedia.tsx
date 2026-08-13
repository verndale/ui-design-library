import type { CardMediaProps } from '../Card.types.js';

/** A clipped media branch with matching pointer, keyboard, and reduced-motion behavior. */
export function CardMedia({ children, className }: CardMediaProps) {
  return (
    <div
      className={[
        'relative shrink-0 overflow-hidden',
        '*:size-full *:object-cover',
        '*:transition-transform *:duration-(--duration-base) *:ease-standard',
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
