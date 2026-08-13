import type { FormEvent, ReactNode, RefObject } from 'react';

import type { SearchInputClassNames } from '../SearchInput.types.js';

import { SearchControls } from './SearchControls.client.js';
import { SearchField } from './SearchField.client.js';

type SearchFormProps = {
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  placeholder: string;
  label: string;
  autoFocus: boolean;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  onSearch?: (query: string) => void;
  clearLabel: string;
  submitLabel: string;
  clearIcon?: ReactNode;
  submitIcon?: ReactNode;
  showClearButton: boolean;
  showSubmitButton: boolean;
  classNames?: SearchInputClassNames;
};

/** Native search form and its keyboard-operable actions. */
export function SearchForm({
  inputId,
  inputRef,
  query,
  placeholder,
  label,
  autoFocus,
  onQueryChange,
  onClear,
  onSearch,
  clearLabel,
  submitLabel,
  clearIcon,
  submitIcon,
  showClearButton,
  showSubmitButton,
  classNames,
}: SearchFormProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch?.(trimmed);
  };

  return (
    <form role="search" onSubmit={submit} className={['relative flex w-full items-center', classNames?.form].filter(Boolean).join(' ')}>
      <SearchField
        inputId={inputId}
        inputRef={inputRef}
        query={query}
        placeholder={placeholder}
        label={label}
        autoFocus={autoFocus}
        onQueryChange={onQueryChange}
        classNames={classNames}
      />
      <SearchControls
        hasQuery={query.length > 0}
        onClear={onClear}
        clearLabel={clearLabel}
        submitLabel={submitLabel}
        clearIcon={clearIcon}
        submitIcon={submitIcon}
        showClearButton={showClearButton}
        showSubmitButton={showSubmitButton}
        classNames={classNames}
      />
    </form>
  );
}
