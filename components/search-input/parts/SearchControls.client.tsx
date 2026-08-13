import { ClearGlyph, SearchGlyph } from './SearchIcons.js';

const control = [
  'flex cursor-pointer items-center justify-center rounded-pill',
  'transition-colors duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
].join(' ');

/** Clear and submit controls layered inside the search field. */
export function SearchControls({ hasQuery, onClear }: { hasQuery: boolean; onClear: () => void }) {
  return (
    <div className="absolute inset-y-0 right-[var(--spacing-3xs)] flex items-center gap-3xs">
      {hasQuery ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className={`${control} size-[var(--size-touch-small)] text-text-secondary hover:bg-surface-sunken`}
        >
          <ClearGlyph />
        </button>
      ) : null}
      <button
        type="submit"
        aria-label="Submit search"
        className={`${control} size-[var(--size-touch-medium)] bg-control-primary-bg text-control-primary-text hover:bg-control-primary-bg-hover`}
      >
        <SearchGlyph />
      </button>
    </div>
  );
}
