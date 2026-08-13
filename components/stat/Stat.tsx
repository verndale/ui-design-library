import type { StatProps } from './Stat.types.js';

/**
 * A single statistic: a prominent value paired with a describing label.
 *
 * Value-then-label in reading order — the figure leads, the label gives it
 * meaning. The surface is the caller's: wrap in a Card for the boxed treatment.
 * A lone stat is content, not a widget, so it carries no role of its own; a
 * group of stats gets its accessible name from StatGroup.
 */
export function Stat({ value, label, description, className, classNames, contentOrder = 'value-first' }: StatProps) {
  const valueNode = <p className={['m-0 text-6xl font-extrabold text-text-primary', classNames?.value].filter(Boolean).join(' ')}>{value}</p>;
  const labelNode = <p className={['m-0 text-base font-semibold text-text-primary', classNames?.label].filter(Boolean).join(' ')}>{label}</p>;
  return (
    <div data-component="stat" className={['flex flex-col gap-2xs', classNames?.root, className].filter(Boolean).join(' ')}>
      {contentOrder === 'label-first' ? labelNode : valueNode}
      {contentOrder === 'label-first' ? valueNode : labelNode}
      {description ? <p className={['m-0 mt-3xs text-base text-text-secondary', classNames?.description].filter(Boolean).join(' ')}>{description}</p> : null}
    </div>
  );
}
