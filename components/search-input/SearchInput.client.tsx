import { useId, useRef, useState } from 'react';

import { SearchForm } from './parts/SearchForm.client.js';
import { SearchResults } from './parts/SearchResults.js';
import type { SearchInputProps } from './SearchInput.types.js';

/** A controlled or uncontrolled search field with clear, submit, and results branches. */
export function SearchInput({
  placeholder = 'Search',
  onSearch,
  className,
  value: controlledValue,
  onChange,
  autoFocus = false,
  results,
}: SearchInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState('');
  const controlled = controlledValue !== undefined;
  const query = controlled ? controlledValue : internalValue;

  const updateQuery = (value: string) => {
    if (controlled) onChange?.(value);
    else setInternalValue(value);
  };

  const clear = () => {
    updateQuery('');
    inputRef.current?.focus();
  };

  return (
    <div data-component="search-input" className={['flex flex-col gap-2xs', className].filter(Boolean).join(' ')}>
      <SearchForm
        inputId={inputId}
        inputRef={inputRef}
        query={query}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onQueryChange={updateQuery}
        onClear={clear}
        onSearch={onSearch}
      />
      <SearchResults>{results}</SearchResults>
    </div>
  );
}
