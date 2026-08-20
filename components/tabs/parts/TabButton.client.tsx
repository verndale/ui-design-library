import { forwardRef, type ButtonHTMLAttributes } from 'react';

import type { TabsPresentation } from '../Tabs.types.js';

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  presentation: TabsPresentation;
};

const base = [
  'inline-flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center',
  'text-base leading-none transition-[color,background-color] duration-(--duration-base) ease-standard',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
].join(' ');

/** A single roving-focus tab; selection state remains owned by the controller. */
export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { selected, presentation, className, ...props },
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
      data-presentation={presentation}
      className={[
        base,
        presentation === 'pills'
          ? 'rounded-pill px-m py-2xs'
          : 'rounded-none border-b border-border-subtle px-m py-2xs',
        presentation === 'pills' && selected ? 'bg-surface-inverse text-text-inverse' : null,
        presentation === 'pills' && !selected ? 'text-text-secondary hover:text-text-primary' : null,
        presentation === 'stroke' && selected ? 'border-border-accent text-text-primary' : null,
        presentation === 'stroke' && !selected
          ? 'text-text-secondary hover:border-border-strong hover:text-text-primary'
          : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
});
