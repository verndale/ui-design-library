import { useId } from 'react';

import { classes } from '../../src/lib/classNames.js';
import { SegmentedControlGroup } from './parts/SegmentedControlGroup.js';
import { SegmentedControlMessage } from './parts/SegmentedControlMessage.js';
import type { SegmentedControlProps } from './SegmentedControl.types.js';

/** A compact, native radio group for mutually exclusive peer options. */
export function SegmentedControl({
  legend,
  options,
  value,
  defaultValue,
  onChange,
  name: suppliedName,
  disabled = false,
  hideLegend = false,
  helperText,
  error = false,
  errorMessage,
  className,
  classNames,
}: SegmentedControlProps) {
  const reactId = useId();
  const name = suppliedName ?? `segmented-control-${reactId}`;
  const helperId = `${name}-helper`;
  const errorId = `${name}-error`;
  const describedBy = error && errorMessage ? errorId : helperText ? helperId : undefined;

  return (
    <fieldset
      data-component="segmented-control"
      aria-describedby={describedBy}
      className={classes('grid min-w-0 gap-2xs border-0 p-0', classNames?.root, className)}
    >
      <legend className={classes('mb-2xs text-sm font-medium text-text-primary', hideLegend && 'sr-only', classNames?.legend)}>
        {legend}
      </legend>
      <SegmentedControlGroup
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        name={name}
        disabled={disabled}
        error={error}
        classNames={classNames}
      />
      <SegmentedControlMessage
        helperId={helperId}
        errorId={errorId}
        helperText={helperText}
        error={error}
        errorMessage={errorMessage}
        classNames={classNames}
      />
    </fieldset>
  );
}
