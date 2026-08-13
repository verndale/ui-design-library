import type { LinkProps, LinkSize } from './Link.types.js';
import { LinkContent } from './parts/LinkContent.js';

export type { LinkProps, LinkSize } from './Link.types.js';

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

/** A framework-neutral text link with a multiline animated underline. */
export function Link({
  children,
  className,
  size = 'large',
  as: Component = 'a',
  touchTarget = false,
  startIcon,
  endIcon,
  disabled = false,
  classNames,
  href,
  role,
  tabIndex,
  onClick,
  onKeyDown,
  ...rest
}: LinkProps) {
  const ResolvedComponent = disabled ? 'a' : Component;

  return (
    <ResolvedComponent
      data-component="link"
      aria-disabled={disabled || undefined}
      href={disabled ? undefined : href}
      role={disabled ? 'link' : role}
      tabIndex={disabled ? (tabIndex ?? 0) : tabIndex}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : onKeyDown}
      className={[
        'group inline-block max-w-full min-w-0 align-middle leading-none text-link no-underline',
        'transition-opacity duration-[var(--duration-fast)] ease-standard hover:opacity-90 motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        'aria-disabled:pointer-events-none aria-disabled:opacity-40',
        SIZES[size],
        touchTarget ? TOUCH[size] : undefined,
        classNames?.root,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <LinkContent size={size} startIcon={startIcon} endIcon={endIcon} classNames={classNames}>
        {children}
      </LinkContent>
    </ResolvedComponent>
  );
}
