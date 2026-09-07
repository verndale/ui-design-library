import { classes } from '../../../src/lib/classNames.js';
import type { DatepickerClassNames, DatepickerRange } from '../Datepicker.types.js';
import { addMonths } from '../lib/dateMath.js';
import { CalendarGrid } from './CalendarGrid.client.js';

export function CalendarPanel({ id, month, setMonth, value, mode, min, max, onSelect, classNames }: {
  id: string;
  month: Date;
  setMonth: (month: Date) => void;
  value: Date | null | DatepickerRange;
  mode: 'single' | 'range';
  min?: Date;
  max?: Date;
  onSelect: (date: Date) => void;
  classNames?: DatepickerClassNames;
}) {
  const label = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return (
    <div id={id} role="dialog" aria-modal="false" aria-label="Choose date" className={classes(
      'fixed inset-x-s bottom-s z-50 rounded-medium border border-border-subtle bg-surface-raised p-s shadow-overlay',
      'md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-[calc(100%+var(--spacing-2xs))] md:w-[22rem]',
      classNames?.popover,
    )}>
      <div className={classes('mb-s flex items-center justify-between', classNames?.header)}>
        <button type="button" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))} className="size-(--size-touch-small) rounded-pill hover:bg-surface-sunken">‹</button>
        <strong aria-live="polite" aria-atomic="true" className="text-base text-text-primary">{label}</strong>
        <button type="button" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} className="size-(--size-touch-small) rounded-pill hover:bg-surface-sunken">›</button>
      </div>
      <div className={classNames?.calendar}><CalendarGrid month={month} value={value} mode={mode} min={min} max={max} onSelect={onSelect} classNames={classNames} /></div>
    </div>
  );
}
