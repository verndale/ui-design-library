import type { SliderOption } from '../Slider.types.js';

/** Selected option detail associated with the native range control. */
export function SliderSelectedValue({
  displayId,
  selected,
  unit,
}: {
  displayId: string;
  selected: SliderOption;
  unit?: string;
}) {
  return (
    <>
      <p id={displayId} className="m-0 text-base font-semibold text-text-primary">
        {selected.label}
        {unit ? <span className="ms-3xs font-normal text-text-secondary">{unit}</span> : null}
      </p>
      {selected.description ? <p className="m-0 text-sm text-text-secondary">{selected.description}</p> : null}
    </>
  );
}
