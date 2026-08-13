import type { ToastVariant } from '../Toast.types.js';

/** Decorative tone icon; live-region semantics carry the actual severity. */
export function ToastIcon({ variant }: { variant: ToastVariant }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      {variant === 'critical' ? (
        <>
          <path d="M8 4v4.5" strokeLinecap="round" />
          <path d="M8 11.5h.01" strokeLinecap="round" />
        </>
      ) : (
        <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
