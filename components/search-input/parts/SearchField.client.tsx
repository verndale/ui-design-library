import type { RefObject } from 'react';

type SearchFieldProps = {
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  placeholder: string;
  autoFocus: boolean;
  onQueryChange: (value: string) => void;
};

/** The labelled text field is independent from the actions layered beside it. */
export function SearchField({
  inputId,
  inputRef,
  query,
  placeholder,
  autoFocus,
  onQueryChange,
}: SearchFieldProps) {
  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
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
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        ].join(' ')}
      />
    </>
  );
}
