import type { FormEvent, RefObject } from 'react';

import { SearchControls } from './SearchControls.client.js';
import { SearchField } from './SearchField.client.js';

type SearchFormProps = {
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  placeholder: string;
  autoFocus: boolean;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  onSearch?: (query: string) => void;
};

/** Native search form and its keyboard-operable actions. */
export function SearchForm({
  inputId,
  inputRef,
  query,
  placeholder,
  autoFocus,
  onQueryChange,
  onClear,
  onSearch,
}: SearchFormProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch?.(trimmed);
  };

  return (
    <form role="search" onSubmit={submit} className="relative flex w-full items-center">
      <SearchField
        inputId={inputId}
        inputRef={inputRef}
        query={query}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onQueryChange={onQueryChange}
      />
      <SearchControls hasQuery={query.length > 0} onClear={onClear} />
    </form>
  );
}
