import type { RefObject } from 'react';

import type { SearchInputClassNames } from '../SearchInput.types.js';

type SearchFieldProps = {
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  placeholder: string;
  label: string;
  autoFocus: boolean;
  onQueryChange: (value: string) => void;
  classNames?: SearchInputClassNames;
};

/** The labelled text field is independent from the actions layered beside it. */
export function SearchField({
  inputId,
  inputRef,
  query,
  placeholder,
  label,
  autoFocus,
  onQueryChange,
  classNames,
}: SearchFieldProps) {
  return (
    <>
      <label htmlFor={inputId} className={['sr-only', classNames?.label].filter(Boolean).join(' ')}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className={[
          'min-h-[var(--size-touch-large)] w-full rounded-pill border-0 bg-surface-raised',
          'pl-s pr-[5.5rem] text-base text-text-primary placeholder:text-text-secondary',
          'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          classNames?.input,
        ].filter(Boolean).join(' ')}
      />
    </>
  );
}
