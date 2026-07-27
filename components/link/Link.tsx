import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';

import { animatedUnderline } from '../../src/lib/underline';

export type LinkSize = 'large' | 'medium' | 'small';

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
  children: ReactNode;
  className?: string;
  size?: LinkSize;
  /**
   * Render as a different element — pass a router's link component here. The
   * library stays framework-neutral by never importing one itself.
   */
  as?: ElementType;
  /**
   * Add an invisible `::before` hit pad so the tap target meets the minimum
   * height without the link's layout box growing. Use on standalone or stacked
   * calls to action; leave off for links inline in a paragraph.
   */
  touchTarget?: boolean;
  /** Decorative leading icon. */
  startIcon?: ReactNode;
  /** Decorative trailing icon. */
  endIcon?: ReactNode;
  disabled?: boolean;
};

const SIZES: Record<LinkSize, string> = {
  large: 'px-3xs py-2xs text-base',
  medium: 'px-3xs py-3xs text-base',
  small: 'px-3xs py-3xs text-sm',
};

const TOUCH: Record<LinkSize, string> = {
  large: "relative before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:w-full before:content-[''] before:min-h-[var(--size-touch-large)]",
  medium: "relative before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:w-full before:content-[''] before:min-h-[var(--size-touch-medium)]",
  small: "relative before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:w-full before:content-[''] before:min-h-[var(--size-touch-small)]",
};

const iconSlot = (size: LinkSize, side: 'start' | 'end') =>
  [
    'inline-flex shrink-0 align-middle text-inherit',
    side === 'start' ? 'me-2xs' : 'ms-2xs',
    size === 'small' ? '[&_svg]:size-4' : '[&_svg]:size-5',
  ].join(' ');

/**
 * A text link. The label carries an animated underline that draws on hover and
 * on keyboard focus, and underlines each line separately when the text wraps.
 */
export function Link({
  children,
  className,
  size = 'large',
  as: Component = 'a',
  touchTarget = false,
  startIcon,
  endIcon,
  disabled = false,
  ...rest
}: LinkProps) {
  return (
    <Component
      data-component="link"
      aria-disabled={disabled || undefined}
      className={[
        'group inline-block max-w-full min-w-0 align-middle leading-none text-link no-underline',
        'transition-opacity duration-[var(--duration-fast)] ease-standard hover:opacity-90 motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        'aria-disabled:pointer-events-none aria-disabled:opacity-40',
        SIZES[size],
        touchTarget ? TOUCH[size] : undefined,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {startIcon ? (
        <span aria-hidden className={iconSlot(size, 'start')}>
          {startIcon}
        </span>
      ) : null}
      {/* The underline must live on an inner inline span — see src/lib/underline.ts. */}
      <span className={animatedUnderline}>{children}</span>
      {endIcon ? (
        <span aria-hidden className={iconSlot(size, 'end')}>
          {endIcon}
        </span>
      ) : null}
    </Component>
  );
}
