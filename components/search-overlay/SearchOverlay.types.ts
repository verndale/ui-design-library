import type { ReactNode, RefObject } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type SearchOverlayClassNames = SlotClassNames<
  'backdrop' | 'viewport' | 'dialog' | 'closeButton' | 'closeIcon' | 'header' | 'title' | 'description' | 'search' | 'quickLinks' | 'results'
>;
export type SearchOverlayHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type SearchOverlayProps = {
  open: boolean;
  /** Called on Escape, backdrop click, and the close button. */
  onClose: () => void;
  /** Accessible name rendered as the overlay heading. */
  title: string;
  supportingCopy?: ReactNode;
  /** The consumer-owned search query. */
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit?: (query: string) => void;
  inputPlaceholder?: string;
  quickLinks?: ReactNode;
  resultsPanel?: ReactNode;
  closeLabel?: string;
  returnFocusRef?: RefObject<HTMLElement | null>;
  id?: string;
  className?: string;
  classNames?: SearchOverlayClassNames;
  titleHeadingLevel?: SearchOverlayHeadingLevel;
  closeIcon?: ReactNode;
  inputLabel?: string;
  clearLabel?: string;
  submitLabel?: string;
  resultsLabel?: string;
};
