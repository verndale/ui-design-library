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
  classNames,
  inputId: suppliedInputId,
  showScale = true,
  showSelectedValue = true,
}: SliderProps) {
  const generatedInputId = useId();
  const inputId = suppliedInputId ?? generatedInputId;
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
    <div data-component="slider" className={['flex flex-col gap-2xs', classNames?.root, className].filter(Boolean).join(' ')}>
      <div className={['flex items-baseline justify-between gap-s', classNames?.header].filter(Boolean).join(' ')}>
        <label htmlFor={inputId} className={['text-base font-semibold text-text-primary', classNames?.label].filter(Boolean).join(' ')}>{label}</label>
        {hint ? <span id={hintId} className={['text-sm text-text-secondary', classNames?.hint].filter(Boolean).join(' ')}>{hint}</span> : null}
      </div>
      <SliderTrack
        inputId={inputId}
        index={index}
        lastIndex={lastIndex}
        options={options}
        valueText={valueText}
        describedBy={[showSelectedValue ? displayId : null, hint ? hintId : null].filter(Boolean).join(' ')}
        progress={`${progress}%`}
        onChange={selectIndex}
        classNames={classNames}
      />
      {showScale ? <SliderScale
        firstLabel={options[0]?.label}
        lastLabel={lastIndex > 0 ? options[lastIndex]?.label : undefined}
        classNames={classNames}
      /> : null}
      {showSelectedValue ? <SliderSelectedValue displayId={displayId} selected={selected} unit={unit} classNames={classNames} /> : null}
    </div>
  );
}
