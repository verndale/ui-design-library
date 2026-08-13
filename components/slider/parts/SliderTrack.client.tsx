import type { SliderClassNames, SliderOption } from '../Slider.types.js';

type SliderTrackProps = {
  inputId: string;
  index: number;
  lastIndex: number;
  options: SliderOption[];
  valueText: string;
  describedBy: string;
  progress: string;
  onChange: (index: number) => void;
  classNames?: SliderClassNames;
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
  classNames,
}: SliderTrackProps) {
  return (
    <div className={['relative flex items-center py-2xs', classNames?.track].filter(Boolean).join(' ')}>
      <span aria-hidden className={['pointer-events-none absolute inset-x-0 h-1 rounded-pill bg-border-subtle', classNames?.trackBase].filter(Boolean).join(' ')} />
      <span
        aria-hidden
        className={['pointer-events-none absolute start-0 h-1 rounded-pill bg-action-base', classNames?.trackFill].filter(Boolean).join(' ')}
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
        aria-describedby={describedBy || undefined}
        className={[
          'relative w-full cursor-pointer appearance-none bg-transparent',
          'min-h-(--size-touch-medium)',
          focusRing,
          classNames?.input,
        ].filter(Boolean).join(' ')}
      />
      <span aria-hidden className={['pointer-events-none absolute inset-x-0 flex justify-between', classNames?.ticks].filter(Boolean).join(' ')}>
        {options.map((option) => <span key={option.value} className={['size-1 rounded-pill bg-border-subtle', classNames?.tick].filter(Boolean).join(' ')} />)}
      </span>
    </div>
  );
}
