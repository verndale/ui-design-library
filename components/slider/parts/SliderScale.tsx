import type { SliderClassNames } from '../Slider.types.js';

/** Visual endpoints for the discrete option scale. */
export function SliderScale({ firstLabel, lastLabel, classNames }: { firstLabel?: string; lastLabel?: string; classNames?: SliderClassNames }) {
  return (
    <div aria-hidden className={['flex justify-between text-sm text-text-secondary', classNames?.scale].filter(Boolean).join(' ')}>
      <span className={classNames?.scaleStart}>{firstLabel}</span>
      {lastLabel ? <span className={classNames?.scaleEnd}>{lastLabel}</span> : null}
    </div>
  );
}
