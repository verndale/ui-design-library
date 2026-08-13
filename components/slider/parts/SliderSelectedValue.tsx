import type { SliderClassNames, SliderOption } from '../Slider.types.js';

/** Selected option detail associated with the native range control. */
export function SliderSelectedValue({
  displayId,
  selected,
  unit,
  classNames,
}: {
  displayId: string;
  selected: SliderOption;
  unit?: string;
  classNames?: SliderClassNames;
}) {
  return (
    <>
      <p id={displayId} className={['m-0 text-base font-semibold text-text-primary', classNames?.selectedValue].filter(Boolean).join(' ')}>
        {selected.label}
        {unit ? <span className={['ms-3xs font-normal text-text-secondary', classNames?.unit].filter(Boolean).join(' ')}>{unit}</span> : null}
      </p>
      {selected.description ? <p className={['m-0 text-sm text-text-secondary', classNames?.description].filter(Boolean).join(' ')}>{selected.description}</p> : null}
    </>
  );
}
