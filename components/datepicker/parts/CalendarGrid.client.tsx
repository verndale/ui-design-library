import { classes } from '../../../src/lib/classNames.js';
import type { DatepickerClassNames, DatepickerRange } from '../Datepicker.types.js';
import { inRange, monthDays, sameDay } from '../lib/dateMath.js';

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CalendarGrid({ month, value, mode, min, max, onSelect, classNames }: {
  month: Date;
  value: Date | null | DatepickerRange;
  mode: 'single' | 'range';
  min?: Date;
  max?: Date;
  onSelect: (date: Date) => void;
  classNames?: DatepickerClassNames;
}) {
  const days = monthDays(month);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const range = mode === 'range' ? value as DatepickerRange : null;
  const single = mode === 'single' ? value as Date | null : null;
  return (
    <div role="grid" aria-label={month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} className={classes('grid gap-3xs', classNames?.grid)}>
      <div role="row" className="grid grid-cols-7 gap-3xs">
        {weekdays.map((day) => <span key={day} role="columnheader" className="py-3xs text-center text-xs text-text-secondary">{day}</span>)}
      </div>
      {weeks.map((week) => <div key={week[0]?.toISOString()} role="row" className="grid grid-cols-7 gap-3xs">
        {week.map((day) => {
          const selected = sameDay(single, day) || sameDay(range?.start, day) || sameDay(range?.end, day);
          const unavailable = Boolean((min && day < min) || (max && day > max));
          const outside = day.getMonth() !== month.getMonth();
          return <button
            key={day.toISOString()}
            type="button"
            role="gridcell"
            aria-selected={selected}
            aria-label={day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            disabled={unavailable}
            onClick={() => onSelect(day)}
            className={classes(
              'flex size-(--size-touch-small) items-center justify-center rounded-pill text-sm text-text-primary',
              'hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus',
              outside && 'text-text-secondary',
              range && inRange(day, range.start, range.end) && 'bg-surface-sunken',
              selected && 'bg-action-base text-text-inverse hover:bg-action-hover',
              'disabled:cursor-not-allowed disabled:text-control-disabled-text',
              classNames?.day,
            )}
          >{day.getDate()}</button>;
        })}
      </div>)}
    </div>
  );
}
