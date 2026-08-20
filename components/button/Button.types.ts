import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type ButtonClassNames = SlotClassNames<'root' | 'startIcon' | 'content' | 'endIcon'>;

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'large' | 'medium' | 'small';
export type ButtonPresentation = 'label' | 'icon-only';
/** Which surface the button sits on. `ghost` is intended for dark or imagery. */
export type ButtonSurface = 'light' | 'dark';

type ButtonBaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'className'> & {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Selects the semantic palette for the surface under the button. */
  surface?: ButtonSurface;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  classNames?: ButtonClassNames;
};

type LabelButtonProps = ButtonBaseProps & {
  presentation?: 'label';
  'aria-label'?: string;
};

type IconOnlyButtonProps = Omit<ButtonBaseProps, 'startIcon' | 'endIcon'> & {
  presentation: 'icon-only';
  /** Required because icon-only controls have no visible text alternative. */
  'aria-label': string;
  startIcon?: never;
  endIcon?: never;
};

export type ButtonProps = LabelButtonProps | IconOnlyButtonProps;
