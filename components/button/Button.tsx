import { ButtonContent } from './parts/ButtonContent.js';
import type { ButtonProps, ButtonSize, ButtonSurface, ButtonVariant } from './Button.types.js';

export type { ButtonProps, ButtonSize, ButtonSurface, ButtonVariant } from './Button.types.js';

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

const VARIANTS_DARK: Record<ButtonVariant, string> = {
  primary: 'border border-transparent bg-surface-base text-text-primary hover:bg-surface-sunken',
  secondary:
    'border border-solid border-text-inverse bg-transparent text-text-inverse hover:bg-text-inverse hover:text-text-primary',
  ghost: VARIANTS.ghost,
};

/** A native control that performs an in-page action. If it navigates, use Link. */
export function Button({
  children,
  className,
  variant = 'primary',
  size = 'large',
  surface = 'light',
  startIcon,
  endIcon,
  type = 'button',
  ...rest
}: ButtonProps) {
  const palette = surface === 'dark' ? VARIANTS_DARK : VARIANTS;

  return (
    <button
      type={type}
      data-component="button"
      data-surface={surface}
      className={[
        'inline-flex cursor-pointer items-center justify-center rounded-pill text-center leading-none',
        'transition-colors duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        'disabled:pointer-events-none disabled:border-transparent disabled:bg-control-disabled-bg disabled:text-control-disabled-text',
        SIZES[size],
        palette[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <ButtonContent size={size} startIcon={startIcon} endIcon={endIcon}>
        {children}
      </ButtonContent>
    </button>
  );
}
