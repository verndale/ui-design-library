'use client';

import { useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { CloseButton } from '../../src/lib/CloseButton';
import { useDialog } from '../../src/lib/dialog';
import { SearchInput } from '../search-input/SearchInput';

export type SearchOverlayProps = {
  /** Whether the overlay is open. The consumer owns this state. */
  open: boolean;
  /** Called on Escape, backdrop click, and the close button. */
  onClose: () => void;
  /** Accessible name for the overlay, rendered as its heading. Required. */
  title: string;
  /** Supporting copy below the heading; shown in the idle state and used as the overlay description. */
  supportingCopy?: ReactNode;
  /** The search query. The consumer owns this state. */
  query: string;
  /** Called with the raw query on every keystroke. */
  onQueryChange: (value: string) => void;
  /** Called with the trimmed query on submit; a blank query does not fire. */
  onSubmit?: (query: string) => void;
  /** Placeholder and accessible name for the search field. */
  inputPlaceholder?: string;
  /** Idle-state content — entry points shown while the query is empty (e.g. a quick-links grid). */
  quickLinks?: ReactNode;
  /** Active-state content — results shown once the visitor types (e.g. recent searches + suggestions). */
  resultsPanel?: ReactNode;
  /** Accessible label for the close control. */
  closeLabel?: string;
  /** Focus returns here after close. Defaults to whatever was focused on open. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * A full-width surface that opens over the page to host a search experience: a
 * prominent field with a heading and supporting copy, plus idle entry points
 * (quick links) that give way to a results panel once the visitor types.
 *
 * Owns the open/closed × idle/active state machine and defers the rest to shared
 * pieces: the dialog contract (focus trap, scroll lock, Escape/backdrop
 * dismissal, focus restoration) to `useDialog`, the field itself to the
 * library's `SearchInput` — its submit, clear, and polite results region carry
 * over — and the dismiss control to the shared `CloseButton`. The consumer owns
 * the query and the content of both slots.
 */
export function SearchOverlay({
  open,
  onClose,
  title,
  supportingCopy,
  query,
  onQueryChange,
  onSubmit,
  inputPlaceholder = 'Search',
  quickLinks,
  resultsPanel,
  closeLabel = 'Close search',
  returnFocusRef,
}: SearchOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // The empty/typing split. Idle shows the quick links; active swaps in the
  // results panel, which rides through SearchInput's own live region.
  const active = query.trim().length > 0;
  const showResults = active && resultsPanel != null;

  // Place initial focus on the search field through useDialog rather than
  // SearchInput's `autoFocus`: autoFocus fires during commit, before the hook
  // captures the opener, so the opener would be recorded as the field itself and
  // focus would never return to the trigger on close. useDialog captures the
  // opener first, then applies this on the next frame.
  const { mounted } = useDialog({
    open,
    onClose,
    containerRef: dialogRef,
    returnFocusRef,
    onOpenFocus: (root) => root.querySelector<HTMLInputElement>('input')?.focus(),
  });

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div
        aria-hidden
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        className="fixed inset-0 z-100 bg-surface-scrim animate-fade-in"
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-100 flex justify-center">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={!active && supportingCopy ? descriptionId : undefined}
          tabIndex={-1}
          data-component="search-overlay"
          className={[
            'pointer-events-auto relative flex max-h-dvh w-full max-w-[900px] flex-col overflow-y-auto',
            'bg-surface-raised text-text-primary shadow-overlay',
            'px-page-margin pt-l pb-xl',
            'lg:rounded-b-medium',
            'animate-scale-in',
          ].join(' ')}
        >
          <CloseButton label={closeLabel} onClick={onClose} className="absolute end-s top-s" />

          <div className="flex flex-col gap-2xs pe-xl">
            <h2 id={titleId} className="m-0 text-2xl font-semibold text-text-primary">
              {title}
            </h2>
            {!active && supportingCopy ? (
              <div id={descriptionId} className="text-text-secondary">
                {supportingCopy}
              </div>
            ) : null}
          </div>

          <div className="mt-m">
            <SearchInput
              value={query}
              onChange={onQueryChange}
              onSearch={onSubmit}
              placeholder={inputPlaceholder}
              results={showResults ? resultsPanel : undefined}
            />
          </div>

          {!active && quickLinks != null ? <div className="mt-l flex flex-col gap-s">{quickLinks}</div> : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
