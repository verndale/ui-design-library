'use client';

import { useId, useState, type ReactNode } from 'react';

export type SliderOption = {
  /** The value emitted to `onChange` when this option is selected. */
  value: string;
  /** The human label announced and displayed for this option. */
  label: string;
  /** Optional detail shown below the control while this option is selected. */
  description?: ReactNode;
};

export type SliderProps = {
  /** The control's visible label. Required — a slider with no label is unusable. */
  label: ReactNode;
  /** The discrete scale, in order. The thumb moves between these, not over a numeric range. */
  options: SliderOption[];
  /** Selected option `value` (controlled). */
  value?: string;
  /** Selected option `value` for the uncontrolled case. Defaults to the first option. */
  defaultValue?: string;
  /** Called with the newly-selected option's `value` and the option itself. */
  onChange?: (value: string, option: SliderOption) => void;
  /** Optional guidance, associated with the control via `aria-describedby`. */
  hint?: ReactNode;
  /** Unit appended to the announced and displayed value ("inches" → "36 inches"). */
  unit?: string;
  className?: string;
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

/**
 * A slider over a set of named options rather than a numeric range.
 *
 * The native `input[type=range]` carries the option *index*, while the API speaks
 * in option *values* — which is what makes a labelled, stepped scale work without
 * asking consumers to map numbers back to meaning. The index is an implementation
 * detail and never escapes.
 *
 * The behaviour worth keeping is `aria-valuetext`: a range input announces its raw
 * numeric value, so without it a screen reader says "2" where the user sees
 * "36 inches". Every decorative part — the painted track, the tick marks, the
 * min/max scale row — is `aria-hidden`, so the accessibility tree sees exactly one
 * labelled control with a readable value.
 */
export function Slider({
  label,
  options,
  value,
  defaultValue,
  onChange,
  hint,
  unit,
  className,
}: SliderProps) {
  const inputId = useId();
  const displayId = useId();
  const hintId = useId();

  const indexOf = (v: string | undefined) => {
    const found = options.findIndex((option) => option.value === v);
    return found === -1 ? 0 : found;
  };

  const [uncontrolled, setUncontrolled] = useState(() => indexOf(defaultValue));
  const controlled = value !== undefined;
  // Clamped against the live options length, so a stale value or a shortened
  // scale can never point the thumb at an option that is not there.
  const lastIndex = Math.max(options.length - 1, 0);
  const index = Math.min(controlled ? indexOf(value) : uncontrolled, lastIndex);
  const selected = options[index];

  if (!selected) return null;

  const valueText = unit ? `${selected.label} ${unit}` : selected.label;
  const progress = lastIndex === 0 ? 100 : (index / lastIndex) * 100;

  const handleChange = (next: number) => {
    const option = options[next];
    if (!option) return;
    if (!controlled) setUncontrolled(next);
    onChange?.(option.value, option);
  };

  return (
    <div
      data-component="slider"
      className={['flex flex-col gap-2xs', className].filter(Boolean).join(' ')}
    >
      <div className="flex items-baseline justify-between gap-s">
        <label htmlFor={inputId} className="text-base font-semibold text-text-primary">
          {label}
        </label>
        {hint ? (
          <span id={hintId} className="text-sm text-text-secondary">
            {hint}
          </span>
        ) : null}
      </div>

      <div
        className="relative flex items-center py-2xs"
        style={{ ['--slider-progress' as string]: `${progress}%` }}
      >
        {/* Painted separately so the native thumb stacks above it. Decorative:
            the value it depicts is already announced via aria-valuetext. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-1 rounded-pill bg-border-subtle"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute start-0 h-1 rounded-pill bg-action-base"
          style={{ width: 'var(--slider-progress)' }}
        />

        <input
          id={inputId}
          type="range"
          min={0}
          max={lastIndex}
          step={1}
          value={index}
          onChange={(event) => handleChange(Number(event.target.value))}
          aria-valuetext={valueText}
          aria-describedby={[displayId, hint ? hintId : null].filter(Boolean).join(' ')}
          className={[
            'relative w-full cursor-pointer appearance-none bg-transparent',
            'min-h-[var(--size-touch-medium)]',
            focusRing,
          ].join(' ')}
        />

        {/* Tick marks mirror the options positionally; the scale itself is read
            from `options`, so these carry no data of their own. */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 flex justify-between">
          {options.map((option) => (
            <span key={option.value} className="size-1 rounded-pill bg-border-subtle" />
          ))}
        </span>
      </div>

      <div aria-hidden className="flex justify-between text-sm text-text-secondary">
        <span>{options[0]?.label}</span>
        {lastIndex > 0 ? <span>{options[lastIndex]?.label}</span> : null}
      </div>

      <p id={displayId} className="m-0 text-base font-semibold text-text-primary">
        {selected.label}
        {unit ? <span className="ms-3xs font-normal text-text-secondary">{unit}</span> : null}
      </p>

      {selected.description ? (
        <p className="m-0 text-sm text-text-secondary">{selected.description}</p>
      ) : null}
    </div>
  );
}
