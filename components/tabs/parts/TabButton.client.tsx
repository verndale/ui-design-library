import { forwardRef, type ButtonHTMLAttributes } from 'react';

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean };

const base = [
  'inline-flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center',
  'rounded-pill px-m py-2xs',
  'text-base leading-none transition-[color,background-color] duration-[var(--duration-base)] ease-standard',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
].join(' ');

/** A single roving-focus tab; selection state remains owned by the controller. */
export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { selected, className, ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={[
        base,
        selected ? 'bg-surface-inverse text-text-inverse' : 'text-text-secondary hover:text-text-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
});
