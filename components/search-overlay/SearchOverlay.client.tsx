import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useDialog } from '../../src/lib/dialog.client.js';
import { SearchOverlayPanel } from './parts/SearchOverlayPanel.client.js';
import type { SearchOverlayProps } from './SearchOverlay.types.js';

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
  id,
  className,
  classNames,
  titleHeadingLevel = 2,
  closeIcon,
  inputLabel = 'Search',
  clearLabel = 'Clear search',
  submitLabel = 'Submit search',
  resultsLabel = 'Search results',
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
      id={id}
      className={className}
      classNames={classNames}
      titleHeadingLevel={titleHeadingLevel}
      closeIcon={closeIcon}
      inputLabel={inputLabel}
      clearLabel={clearLabel}
      submitLabel={submitLabel}
      resultsLabel={resultsLabel}
    />,
    portalRoot,
  );
}
