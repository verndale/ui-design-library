import type { ReactNode } from 'react';

type CarouselControlsProps = {
  canPrevious: boolean;
  canNext: boolean;
  previousLabel: string;
  nextLabel: string;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
};

const control =
  'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-solid ' +
  'border-border-strong text-text-primary transition-opacity duration-[var(--duration-fast)] ease-standard ' +
  'motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-30 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

/** Arrow controls and the polite position announcement. */
export function CarouselControls({
  canPrevious,
  canNext,
  previousLabel,
  nextLabel,
  previousIcon,
  nextIcon,
  onPrevious,
  onNext,
}: CarouselControlsProps) {
  return (
    <div className="mt-s flex items-center gap-2xs">
      <button type="button" aria-label={previousLabel} disabled={!canPrevious} onClick={onPrevious} className={control}>
        <span aria-hidden>{previousIcon ?? '‹'}</span>
      </button>
      <button type="button" aria-label={nextLabel} disabled={!canNext} onClick={onNext} className={control}>
        <span aria-hidden>{nextIcon ?? '›'}</span>
      </button>
    </div>
  );
}
