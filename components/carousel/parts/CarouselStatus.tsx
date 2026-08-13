/** A polite slide-position announcement, separate from the controls that change it. */
export function CarouselStatus({ selected, slideCount, separator, className }: { selected: number; slideCount: number; separator: string; className?: string }) {
  return (
    <p aria-live="polite" aria-atomic="true" className={['mt-2xs text-sm text-text-secondary', className].filter(Boolean).join(' ')}>
      {selected + 1} {separator} {slideCount}
    </p>
  );
}
