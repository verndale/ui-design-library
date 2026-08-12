/** A polite slide-position announcement, separate from the controls that change it. */
export function CarouselStatus({ selected, slideCount }: { selected: number; slideCount: number }) {
  return (
    <p aria-live="polite" className="mt-2xs text-sm text-text-secondary">
      {selected + 1} / {slideCount}
    </p>
  );
}
