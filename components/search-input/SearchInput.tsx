'use client';

import { useCallback, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';

export type SearchInputProps = {
  /** Accessible name and placeholder for the field. */
  placeholder?: string;
  /** Fired with the trimmed query on submit; a blank query does not fire. */
  onSearch?: (query: string) => void;
  className?: string;
  /** Controlled query. Pair with `onChange`; omit both to run uncontrolled. */
  value?: string;
  onChange?: (value: string) => void;
  /** Focus the input on mount, e.g. when a search panel opens. */
  autoFocus?: boolean;
  /**
   * Results / suggestions slot. When provided, it renders in a polite live
   * region below the field — the caller owns what a result looks like.
   */
  results?: ReactNode;
};

/** Magnifier — decorative; the button carries the accessible name. */
function SearchGlyph() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11.5 11.5L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Cross — decorative; the button carries the accessible name. */
function ClearGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A text field for entering a search query, with an inline submit control, a
 * clear affordance that appears once there is a query, and an optional live
 * results region. Controlled or uncontrolled.
 */
export function SearchInput({
  placeholder = 'Search',
  onSearch,
  className,
  value: valueControlled,
  onChange: onChangeControlled,
  autoFocus = false,
  results,
}: SearchInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queryInternal, setQueryInternal] = useState('');

  const isControlled = valueControlled !== undefined;
  const query = isControlled ? valueControlled : queryInternal;
  const setQuery = isControlled ? (v: string) => onChangeControlled?.(v) : setQueryInternal;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (query.trim()) onSearch?.(query.trim());
    },
    [query, onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, [setQuery]);

  return (
    <div
      data-component="search-input"
      className={['flex flex-col gap-2xs', className].filter(Boolean).join(' ')}
    >
      <form role="search" onSubmit={handleSubmit} className="relative flex w-full items-center">
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          className={[
            'min-h-[var(--size-touch-large)] w-full rounded-pill border-0 bg-surface-raised',
            'pl-s pr-[5.5rem]',
            'text-base text-text-primary placeholder:text-text-secondary',
            'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          ].join(' ')}
        />
        <div className="absolute inset-y-0 right-[var(--spacing-3xs)] flex items-center gap-3xs">
          {query.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className={[
                'flex size-[var(--size-touch-small)] cursor-pointer items-center justify-center rounded-pill',
                'text-text-secondary transition-colors duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none hover:bg-surface-sunken',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
              ].join(' ')}
            >
              <ClearGlyph />
            </button>
          ) : null}
          <button
            type="submit"
            aria-label="Submit search"
            className={[
              'flex size-[var(--size-touch-medium)] cursor-pointer items-center justify-center rounded-pill',
              'bg-control-primary-bg text-control-primary-text transition-colors duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none hover:bg-control-primary-bg-hover',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
            ].join(' ')}
          >
            <SearchGlyph />
          </button>
        </div>
      </form>

      {results != null ? (
        <div
          role="region"
          aria-live="polite"
          aria-label="Search results"
          className="flex gap-2xs overflow-x-auto"
        >
          {results}
        </div>
      ) : null}
    </div>
  );
}
