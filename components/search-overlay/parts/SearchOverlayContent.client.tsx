import type { ReactNode } from 'react';

import { SearchInput } from '../../search-input/index.js';
import type { SearchOverlayClassNames } from '../SearchOverlay.types.js';

type SearchOverlayContentProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit?: (query: string) => void;
  inputPlaceholder: string;
  quickLinks?: ReactNode;
  resultsPanel?: ReactNode;
  active: boolean;
  classNames?: SearchOverlayClassNames;
  inputLabel: string;
  clearLabel: string;
  submitLabel: string;
  resultsLabel: string;
};

export function SearchOverlayContent({
  query,
  onQueryChange,
  onSubmit,
  inputPlaceholder,
  quickLinks,
  resultsPanel,
  active,
  classNames,
  inputLabel,
  clearLabel,
  submitLabel,
  resultsLabel,
}: SearchOverlayContentProps) {
  return (
    <>
      <div className={['mt-m', classNames?.search].filter(Boolean).join(' ')}>
        <SearchInput
          value={query}
          onChange={onQueryChange}
          onSearch={onSubmit}
          placeholder={inputPlaceholder}
          results={active ? resultsPanel : undefined}
          label={inputLabel}
          ariaLabel={inputLabel}
          clearLabel={clearLabel}
          submitLabel={submitLabel}
          resultsLabel={resultsLabel}
          classNames={{ results: classNames?.results }}
        />
      </div>
      {!active && quickLinks != null ? <div className={['mt-l flex flex-col gap-s', classNames?.quickLinks].filter(Boolean).join(' ')}>{quickLinks}</div> : null}
    </>
  );
}
