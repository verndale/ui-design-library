import type { ReactNode, RefObject } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type ModalClassNames = SlotClassNames<
  'backdrop' | 'viewport' | 'dialog' | 'header' | 'eyebrow' | 'title' | 'description' | 'closeButton' | 'closeIcon' | 'body' | 'footer'
>;
export type ModalHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type ModalProps = {
  /** Whether the dialog is open. The consumer owns this state. */
  open: boolean;
  /** Called on Escape, backdrop click, and the close button. */
  onClose: () => void;
  /** Accessible name for the dialog. */
  title: string;
  closeLabel?: string;
  eyebrow?: ReactNode;
  /** Supporting copy that also becomes the dialog description. */
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'medium' | 'large';
  /** Focus returns here after close; otherwise it returns to the opener. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  id?: string;
  className?: string;
  classNames?: ModalClassNames;
  titleHeadingLevel?: ModalHeadingLevel;
  closeIcon?: ReactNode;
};
