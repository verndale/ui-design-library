import type { StatProps } from './Stat.types.js';

/**
 * A single statistic: a prominent value paired with a describing label.
 *
 * Value-then-label in reading order — the figure leads, the label gives it
 * meaning. The surface is the caller's: wrap in a Card for the boxed treatment.
 * A lone stat is content, not a widget, so it carries no role of its own; a
 * group of stats gets its accessible name from StatGroup.
 */
export function Stat({ value, label, description, className }: StatProps) {
  return (
    <div data-component="stat" className={['flex flex-col gap-2xs', className].filter(Boolean).join(' ')}>
      <p className="m-0 text-6xl font-extrabold text-text-primary">{value}</p>
      <p className="m-0 text-base font-semibold text-text-primary">{label}</p>
      {description ? <p className="m-0 mt-3xs text-base text-text-secondary">{description}</p> : null}
    </div>
  );
}
