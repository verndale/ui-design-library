import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useDialog } from '../../src/lib/dialog.client';
import { SearchOverlayPanel } from './parts/SearchOverlayPanel.client';
import type { SearchOverlayProps } from './SearchOverlay.types';

/** Search overlay controller: portal lifecycle, focus behavior, and idle/active state. */
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
  const active = query.trim().length > 0;
  const { portalRoot, isTopmost } = useDialog({
    open,
    onClose,
    containerRef: dialogRef,
    returnFocusRef,
    onOpenFocus: (root) => root.querySelector<HTMLInputElement>('input')?.focus(),
  });

  if (!portalRoot || !open) return null;

  return createPortal(
    <SearchOverlayPanel
      dialogRef={dialogRef}
      titleId={titleId}
      descriptionId={descriptionId}
      title={title}
      supportingCopy={supportingCopy}
      query={query}
      onQueryChange={onQueryChange}
      onSubmit={onSubmit}
      inputPlaceholder={inputPlaceholder}
      quickLinks={quickLinks}
      resultsPanel={resultsPanel}
      closeLabel={closeLabel}
      active={active}
      isTopmost={isTopmost}
      onClose={onClose}
    />,
    portalRoot,
  );
}
