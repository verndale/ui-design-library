import type { SliderOption } from '../Slider.types';

type SliderTrackProps = {
  inputId: string;
  index: number;
  lastIndex: number;
  options: SliderOption[];
  valueText: string;
  describedBy: string;
  progress: string;
  onChange: (index: number) => void;
};

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

/** Painted track surrounding the one semantic native range control. */
export function SliderTrack({
  inputId,
  index,
  lastIndex,
  options,
  valueText,
  describedBy,
  progress,
  onChange,
}: SliderTrackProps) {
  return (
    <div className="relative flex items-center py-2xs">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 h-1 rounded-pill bg-border-subtle" />
      <span
        aria-hidden
        className="pointer-events-none absolute start-0 h-1 rounded-pill bg-action-base"
        style={{ width: progress }}
      />
      <input
        id={inputId}
        type="range"
        min={0}
        max={lastIndex}
        step={1}
        value={index}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={valueText}
        aria-describedby={describedBy}
        className={[
          'relative w-full cursor-pointer appearance-none bg-transparent',
          'min-h-[var(--size-touch-medium)]',
          focusRing,
        ].join(' ')}
      />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 flex justify-between">
        {options.map((option) => <span key={option.value} className="size-1 rounded-pill bg-border-subtle" />)}
      </span>
    </div>
  );
}
