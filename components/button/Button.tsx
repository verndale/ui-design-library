'use client';

import { createContext, useContext, type ButtonHTMLAttributes, type ElementType, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'large' | 'medium' | 'small';
/** Which surface the button sits on. `ghost` is intended for dark or imagery. */
export type ButtonSurface = 'light' | 'dark';

const SurfaceContext = createContext<ButtonSurface | null>(null);

/**
 * Declare the surface for a subtree so buttons invert without every caller
 * passing a prop. Wrap a dark section once and the buttons inside adapt.
 */
export function ButtonSurfaceProvider({ value, children }: { value: ButtonSurface; children: ReactNode }) {
  return <SurfaceContext.Provider value={value}>{children}</SurfaceContext.Provider>;
}

export function useButtonSurface(): ButtonSurface | null {
  return useContext(SurfaceContext);
}

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Overrides the nearest ButtonSurfaceProvider. */
  surface?: ButtonSurface;
  /**
   * Render as another element. Pass `as="a"` with an `href` when the control
   * navigates — the catalog treats that as a Link, not a Button, and assistive
   * technology depends on the distinction.
   */
  as?: ElementType;
  /** Only meaningful with `as="a"`. A button carrying an href is a Link. */
  href?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

const SIZES: Record<ButtonSize, string> = {
  large: 'min-h-[var(--size-touch-large)] gap-2xs px-s py-2xs text-base',
  medium: 'min-h-[var(--size-touch-medium)] min-w-20 gap-2xs px-s py-2xs text-base',
  small: 'min-h-[var(--size-touch-small)] min-w-20 gap-3xs px-s py-3xs text-sm',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-control-primary-bg text-control-primary-text hover:bg-control-primary-bg-hover',
  secondary:
    'border border-solid border-control-secondary-border bg-control-secondary-bg text-control-secondary-text hover:bg-control-secondary-bg-hover hover:text-control-secondary-text-hover',
  ghost:
    'border border-solid border-control-ghost-border bg-control-ghost-bg text-control-ghost-text backdrop-blur-[20px] hover:bg-control-ghost-bg-hover',
};

/** On a dark surface, primary and secondary swap to the inverse palette. */
const VARIANTS_DARK: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-surface-base text-text-primary hover:bg-surface-sunken',
  secondary:
    'border border-solid border-text-inverse bg-transparent text-text-inverse hover:bg-text-inverse hover:text-text-primary',
  ghost: VARIANTS.ghost,
};

const iconSlot = (size: ButtonSize) =>
  ['inline-flex shrink-0', size === 'small' ? '[&_svg]:size-4' : '[&_svg]:size-5'].join(' ');

/** A control that performs an in-page action. If it navigates, use Link. */
export function Button({
  children,
  className,
  variant = 'primary',
  size = 'large',
  surface,
  as: Component = 'button',
  startIcon,
  endIcon,
  type,
  disabled,
  ...rest
}: ButtonProps) {
  const contextSurface = useButtonSurface();
  const resolved = surface ?? contextSurface ?? 'light';
  const palette = resolved === 'dark' ? VARIANTS_DARK : VARIANTS;

  return (
    <Component
      data-component="button"
      data-surface={resolved}
      // A native button needs an explicit type; anything else must not receive one.
      {...(Component === 'button' ? { type: type ?? 'button', disabled } : { 'aria-disabled': disabled || undefined })}
      className={[
        'inline-flex cursor-pointer items-center justify-center rounded-pill text-center leading-none',
        'transition-colors duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        'disabled:pointer-events-none disabled:border-transparent disabled:bg-control-disabled-bg disabled:text-control-disabled-text',
        'aria-disabled:pointer-events-none aria-disabled:border-transparent aria-disabled:bg-control-disabled-bg aria-disabled:text-control-disabled-text',
        SIZES[size],
        palette[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {startIcon ? (
        <span aria-hidden className={iconSlot(size)}>
          {startIcon}
        </span>
      ) : null}
      {children}
      {endIcon ? (
        <span aria-hidden className={iconSlot(size)}>
          {endIcon}
        </span>
      ) : null}
    </Component>
  );
}
