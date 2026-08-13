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
  inputId: suppliedInputId,
  label = 'Search',
  clearLabel = 'Clear search',
  submitLabel = 'Submit search',
  resultsLabel = 'Search results',
  clearIcon,
  submitIcon,
  showClearButton = true,
  showSubmitButton = true,
  classNames,
}: SearchInputProps) {
  const generatedInputId = useId();
  const inputId = suppliedInputId ?? generatedInputId;
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
    <div data-component="search-input" className={['flex flex-col gap-2xs', classNames?.root, className].filter(Boolean).join(' ')}>
      <SearchForm
        inputId={inputId}
        inputRef={inputRef}
        query={query}
        placeholder={placeholder}
        label={label}
        autoFocus={autoFocus}
        onQueryChange={updateQuery}
        onClear={clear}
        onSearch={onSearch}
        clearLabel={clearLabel}
        submitLabel={submitLabel}
        clearIcon={clearIcon}
        submitIcon={submitIcon}
        showClearButton={showClearButton}
        showSubmitButton={showSubmitButton}
        classNames={classNames}
      />
      <SearchResults label={resultsLabel} className={classNames?.results}>{results}</SearchResults>
    </div>
  );
}
