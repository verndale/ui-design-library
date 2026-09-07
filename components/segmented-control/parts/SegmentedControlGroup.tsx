import { classes } from '../../../src/lib/classNames.js';
import type { SegmentedControlClassNames, SegmentedControlOption } from '../SegmentedControl.types.js';

export function SegmentedControlGroup({
  options,
  value,
  defaultValue,
  onChange,
  name,
  disabled,
  error,
  classNames,
}: {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option: SegmentedControlOption) => void;
  name: string;
  disabled: boolean;
  error: boolean;
  classNames?: SegmentedControlClassNames;
}) {
  return (
    <div className={classes(
      'inline-grid min-h-(--size-touch-medium) auto-cols-fr grid-flow-col rounded-pill border bg-surface-sunken p-3xs',
      error ? 'border-tone-critical' : 'border-border-subtle',
      classNames?.group,
    )}>
      {options.map((option) => (
        <label key={option.value} className={classes(
          'relative min-w-20 cursor-pointer rounded-pill has-[:disabled]:cursor-not-allowed',
          classNames?.option,
        )}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === undefined ? undefined : value === option.value}
            defaultChecked={value === undefined ? defaultValue === option.value : undefined}
            disabled={disabled || option.disabled}
            onChange={() => onChange?.(option.value, option)}
            className={classes('peer sr-only', classNames?.input)}
          />
          <span className={classes(
            'flex min-h-(--size-touch-small) items-center justify-center rounded-pill px-s text-center text-sm font-medium text-text-secondary',
            'transition-colors duration-(--duration-fast) ease-standard motion-reduce:transition-none',
            'peer-checked:bg-surface-raised peer-checked:text-text-primary peer-checked:shadow-sm',
            'peer-hover:text-text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-border-focus',
            'peer-disabled:text-control-disabled-text',
            classNames?.segment,
          )}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
