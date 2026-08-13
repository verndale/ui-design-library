import type { ReactNode } from 'react';

/** The caller-owned results branch and its announcement semantics. */
export function SearchResults({ children, label, className }: { children?: ReactNode; label: string; className?: string }) {
  if (children == null) return null;
  return (
    <div role="region" aria-live="polite" aria-atomic="true" aria-label={label} className={['flex gap-2xs overflow-x-auto', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
