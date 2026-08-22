import { ButtonContent } from './parts/ButtonContent.js';
import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types.js';

export type { ButtonPresentation, ButtonProps, ButtonSize, ButtonSurface, ButtonVariant } from './Button.types.js';

const SIZES: Record<ButtonSize, string> = {
  large: 'min-h-(--size-touch-large) gap-2xs px-s py-2xs text-base',
  medium: 'min-h-(--size-touch-medium) min-w-20 gap-2xs px-s py-2xs text-base',
  small: 'min-h-(--size-touch-small) min-w-20 gap-3xs px-s py-3xs text-sm',
};

const ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  large: 'size-(--size-touch-large)',
  medium: 'size-(--size-touch-medium)',
  small: 'size-(--size-touch-small)',
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
  presentation = 'label',
  variant = 'primary',
  size = 'large',
  surface = 'light',
  startIcon,
  endIcon,
  type = 'button',
  classNames,
  ...rest
}: ButtonProps) {
  const palette = surface === 'dark' ? VARIANTS_DARK : VARIANTS;
  const sizeClassName = presentation === 'icon-only' ? ICON_ONLY_SIZES[size] : SIZES[size];

  return (
    <button
      type={type}
      data-component="button"
      data-presentation={presentation}
      data-surface={surface}
      className={[
        'inline-flex cursor-pointer items-center justify-center text-center leading-none',
        presentation === 'icon-only' ? 'shrink-0 rounded-medium' : 'rounded-pill',
        'transition-colors duration-(--duration-fast) ease-standard motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        'disabled:pointer-events-none disabled:border-transparent disabled:bg-control-disabled-bg disabled:text-control-disabled-text',
        sizeClassName,
        palette[variant],
        classNames?.root,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <ButtonContent presentation={presentation} size={size} startIcon={startIcon} endIcon={endIcon} classNames={classNames}>
        {children}
      </ButtonContent>
    </button>
  );
}
