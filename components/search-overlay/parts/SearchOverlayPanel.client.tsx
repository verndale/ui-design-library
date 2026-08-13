import type { ReactNode, RefObject } from 'react';

import { SearchOverlayContent } from './SearchOverlayContent.client.js';
import { SearchOverlayHeader } from './SearchOverlayHeader.client.js';

type SearchOverlayPanelProps = {
  dialogRef: RefObject<HTMLDivElement | null>;
  titleId: string;
  descriptionId: string;
  title: string;
  supportingCopy?: ReactNode;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit?: (query: string) => void;
  inputPlaceholder: string;
  quickLinks?: ReactNode;
  resultsPanel?: ReactNode;
  closeLabel: string;
  active: boolean;
  isTopmost: boolean;
  onClose: () => void;
};

/** Dialog presentation and the quick-links/results content branches. */
export function SearchOverlayPanel({
  dialogRef,
  titleId,
  descriptionId,
  title,
  supportingCopy,
  query,
  onQueryChange,
  onSubmit,
  inputPlaceholder,
  quickLinks,
  resultsPanel,
  closeLabel,
  active,
  isTopmost,
  onClose,
}: SearchOverlayPanelProps) {
  return (
    <>
      <div
        aria-hidden
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        className="fixed inset-0 z-100 bg-surface-scrim animate-fade-in"
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-100 flex justify-center">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal={isTopmost ? 'true' : undefined}
          aria-hidden={isTopmost ? undefined : true}
          inert={!isTopmost}
          aria-labelledby={titleId}
          aria-describedby={!active && supportingCopy ? descriptionId : undefined}
          tabIndex={-1}
          data-component="search-overlay"
          className={[
            'pointer-events-auto relative flex max-h-dvh w-full max-w-[900px] flex-col overflow-y-auto',
            'bg-surface-raised px-page-margin pt-l pb-xl text-text-primary shadow-overlay',
            'lg:rounded-b-medium animate-scale-in',
          ].join(' ')}
        >
          <SearchOverlayHeader
            titleId={titleId}
            descriptionId={descriptionId}
            title={title}
            supportingCopy={supportingCopy}
            closeLabel={closeLabel}
            active={active}
            onClose={onClose}
          />
          <SearchOverlayContent
            query={query}
            onQueryChange={onQueryChange}
            onSubmit={onSubmit}
            inputPlaceholder={inputPlaceholder}
            quickLinks={quickLinks}
            resultsPanel={resultsPanel}
            active={active}
          />
        </div>
      </div>
    </>
  );
}
