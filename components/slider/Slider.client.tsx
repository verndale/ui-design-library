import { useId, useState } from 'react';

import { SliderTrack } from './parts/SliderTrack.client.js';
import { SliderScale } from './parts/SliderScale.js';
import { SliderSelectedValue } from './parts/SliderSelectedValue.js';
import type { SliderOption, SliderProps } from './Slider.types.js';

function optionIndex(options: SliderOption[], value?: string) {
  const found = options.findIndex((option) => option.value === value);
  return found === -1 ? 0 : found;
}

/** A native range input mapped onto a discrete set of named options. */
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
  const [internalIndex, setInternalIndex] = useState(() => optionIndex(options, defaultValue));
  const controlled = value !== undefined;
  const lastIndex = Math.max(options.length - 1, 0);
  const index = Math.min(controlled ? optionIndex(options, value) : internalIndex, lastIndex);
  const selected = options[index];

  if (!selected) return null;

  const valueText = unit ? `${selected.label} ${unit}` : selected.label;
  const progress = lastIndex === 0 ? 100 : (index / lastIndex) * 100;
  const selectIndex = (next: number) => {
    const option = options[next];
    if (!option) return;
    if (!controlled) setInternalIndex(next);
    onChange?.(option.value, option);
  };

  return (
    <div data-component="slider" className={['flex flex-col gap-2xs', className].filter(Boolean).join(' ')}>
      <div className="flex items-baseline justify-between gap-s">
        <label htmlFor={inputId} className="text-base font-semibold text-text-primary">{label}</label>
        {hint ? <span id={hintId} className="text-sm text-text-secondary">{hint}</span> : null}
      </div>
      <SliderTrack
        inputId={inputId}
        index={index}
        lastIndex={lastIndex}
        options={options}
        valueText={valueText}
        describedBy={[displayId, hint ? hintId : null].filter(Boolean).join(' ')}
        progress={`${progress}%`}
        onChange={selectIndex}
      />
      <SliderScale
        firstLabel={options[0]?.label}
        lastLabel={lastIndex > 0 ? options[lastIndex]?.label : undefined}
      />
      <SliderSelectedValue displayId={displayId} selected={selected} unit={unit} />
    </div>
  );
}
