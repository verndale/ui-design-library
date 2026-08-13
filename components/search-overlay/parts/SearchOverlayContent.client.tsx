import type { ReactNode } from 'react';

import { SearchInput } from '../../search-input/index.js';

type SearchOverlayContentProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit?: (query: string) => void;
  inputPlaceholder: string;
  quickLinks?: ReactNode;
  resultsPanel?: ReactNode;
  active: boolean;
};

export function SearchOverlayContent({
  query,
  onQueryChange,
  onSubmit,
  inputPlaceholder,
  quickLinks,
  resultsPanel,
  active,
}: SearchOverlayContentProps) {
  return (
    <>
      <div className="mt-m">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          onSearch={onSubmit}
          placeholder={inputPlaceholder}
          results={active ? resultsPanel : undefined}
        />
      </div>
      {!active && quickLinks != null ? <div className="mt-l flex flex-col gap-s">{quickLinks}</div> : null}
    </>
  );
}
