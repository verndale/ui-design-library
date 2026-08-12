import type { ReactNode, RefObject } from 'react';

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
};
