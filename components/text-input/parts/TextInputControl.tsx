import { forwardRef } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { TextInputClassNames, TextInputProps, TextInputVariant } from '../TextInput.types.js';

type Props = Omit<TextInputProps, 'label' | 'labelSuffix' | 'helperText' | 'error' | 'errorMessage' | 'className'> & {
  inputSize?: number;
  variant: TextInputVariant;
  classNames?: TextInputClassNames;
};

export const TextInputControl = forwardRef<HTMLInputElement, Props>(function TextInputControl(
  { leadingContent, trailingContent, variant, inputSize, classNames, ...inputProps },
  ref,
) {
  return (
    <div
      className={classes(
        'flex min-w-0 items-center gap-2xs text-text-primary',
        variant === 'default' && 'min-h-(--size-touch-large) rounded-medium border border-border-subtle bg-surface-raised px-s',
        variant === 'borderless' && 'border-0 bg-transparent',
        'focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-2 focus-within:outline-border-focus',
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-control-disabled-bg has-[:disabled]:text-control-disabled-text',
        'has-[[aria-invalid=true]]:border-tone-critical',
        classNames?.control,
      )}
    >
      {leadingContent ? <span aria-hidden className={classes('shrink-0', classNames?.leading)}>{leadingContent}</span> : null}
      <input
        {...inputProps}
        ref={ref}
        size={inputSize}
        className={classes(
          'min-w-0 flex-1 appearance-none border-0 bg-transparent py-2xs text-base text-text-primary outline-2 outline-solid outline-transparent',
          'placeholder:text-text-secondary disabled:cursor-not-allowed disabled:text-control-disabled-text',
          classNames?.input,
        )}
      />
      {trailingContent ? <span className={classes('shrink-0', classNames?.trailing)}>{trailingContent}</span> : null}
    </div>
  );
});
