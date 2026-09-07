import { useId } from 'react';

import { classes } from '../../src/lib/classNames.js';
import { useDatepicker } from './hooks/useDatepicker.client.js';
import { CalendarPanel } from './parts/CalendarPanel.client.js';
import { DatepickerField } from './parts/DatepickerField.client.js';
import type { DatepickerProps, DatepickerRange } from './Datepicker.types.js';

/** A controlled single-date or date-range field with a keyboard-operable calendar dialog. */
export function Datepicker(props: DatepickerProps) {
  const rangeMode = props.mode === 'range';
  const mode = rangeMode ? 'range' : 'single';
  const rangeProps = rangeMode ? props : null;
  const singleProps = rangeMode ? null : props;
  const range = rangeProps?.value ?? null;
  const single = singleProps?.value ?? null;
  const initial = single ?? range?.start ?? props.min ?? new Date();
  const { open, setOpen, month, setMonth, rootRef, triggerRef } = useDatepicker(initial, props.onOpenChange);
  const reactId = useId();
  const dialogId = `datepicker-${reactId}-dialog`;
  const common = {
    onOpen: () => setOpen(!open), open, error: props.error ?? false, errorMessage: props.errorMessage,
    disabled: props.disabled ?? false, readOnly: props.readOnly ?? false, required: props.required ?? false,
    placeholder: props.placeholder ?? 'MM/DD/YYYY', controlsId: dialogId, classNames: props.classNames,
  };

  const select = (date: Date) => {
    if (singleProps) {
      singleProps.onChange(date);
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!rangeProps) return;
    const current = rangeProps.value;
    if (!current.start || current.end) rangeProps.onChange({ start: date, end: null });
    else if (date < current.start) rangeProps.onChange({ start: date, end: current.start });
    else {
      rangeProps.onChange({ start: current.start, end: date });
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={rootRef} data-component="datepicker" data-mode={mode} className={classes('relative grid min-w-0 gap-2xs', props.classNames?.root, props.className)}>
      <div className={classes(rangeMode && 'grid gap-s sm:grid-cols-2', rangeProps?.variant === 'compact' && 'rounded-medium border border-border-subtle bg-surface-raised p-s', props.classNames?.fields)}>
        {singleProps ? <DatepickerField key={single?.toISOString() ?? 'empty'} {...common} value={single} onCommit={singleProps.onChange} label={singleProps.label} helperText={singleProps.helperText} name={singleProps.name} triggerRef={triggerRef} /> : <>
          <DatepickerField key={`start-${range?.start?.toISOString() ?? 'empty'}`} {...common} value={range?.start ?? null} onCommit={(start) => rangeProps?.onChange({ ...rangeProps.value, start })} label={rangeProps?.startLabel ?? 'Start date'} helperText={rangeProps?.helperText} name={rangeProps?.startName} triggerRef={triggerRef} />
          <DatepickerField key={`end-${range?.end?.toISOString() ?? 'empty'}`} {...common} value={range?.end ?? null} onCommit={(end) => rangeProps?.onChange({ ...rangeProps.value, end })} label={rangeProps?.endLabel ?? 'End date'} name={rangeProps?.endName} />
        </>}
      </div>
      {open ? <CalendarPanel id={dialogId} month={month} setMonth={setMonth} value={singleProps ? single : range as DatepickerRange} mode={mode} min={props.min} max={props.max} onSelect={select} classNames={props.classNames} /> : null}
    </div>
  );
}
