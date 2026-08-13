import type { ReactNode } from 'react';

import type { SearchInputClassNames } from '../SearchInput.types.js';
import { ClearGlyph, SearchGlyph } from './SearchIcons.js';

const control = [
  'flex cursor-pointer items-center justify-center rounded-pill',
  'transition-colors duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
].join(' ');

/** Clear and submit controls layered inside the search field. */
export function SearchControls({
  hasQuery,
  onClear,
  clearLabel,
  submitLabel,
  clearIcon,
  submitIcon,
  showClearButton,
  showSubmitButton,
  classNames,
}: {
  hasQuery: boolean;
  onClear: () => void;
  clearLabel: string;
  submitLabel: string;
  clearIcon?: ReactNode;
  submitIcon?: ReactNode;
  showClearButton: boolean;
  showSubmitButton: boolean;
  classNames?: SearchInputClassNames;
}) {
  return (
    <div className={['absolute inset-y-0 right-[var(--spacing-3xs)] flex items-center gap-3xs', classNames?.controls].filter(Boolean).join(' ')}>
      {hasQuery && showClearButton ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel}
          className={[control, 'size-[var(--size-touch-small)] text-text-secondary hover:bg-surface-sunken', classNames?.clearButton].filter(Boolean).join(' ')}
        >
          <span aria-hidden className={classNames?.clearIcon}>{clearIcon ?? <ClearGlyph />}</span>
        </button>
      ) : null}
      {showSubmitButton ? <button
        type="submit"
        aria-label={submitLabel}
        className={[control, 'size-[var(--size-touch-medium)] bg-control-primary-bg text-control-primary-text hover:bg-control-primary-bg-hover', classNames?.submitButton].filter(Boolean).join(' ')}
      >
        <span aria-hidden className={classNames?.submitIcon}>{submitIcon ?? <SearchGlyph />}</span>
      </button> : null}
    </div>
  );
}
