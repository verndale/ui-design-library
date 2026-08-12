import type { ReactNode } from 'react';

/** The caller-owned results branch and its announcement semantics. */
export function SearchResults({ children }: { children?: ReactNode }) {
  if (children == null) return null;
  return (
    <div role="region" aria-live="polite" aria-label="Search results" className="flex gap-2xs overflow-x-auto">
      {children}
    </div>
  );
}
