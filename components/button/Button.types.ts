import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'large' | 'medium' | 'small';
/** Which surface the button sits on. `ghost` is intended for dark or imagery. */
export type ButtonSurface = 'light' | 'dark';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Selects the semantic palette for the surface under the button. */
  surface?: ButtonSurface;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};
