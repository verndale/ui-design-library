import { forwardRef, useId } from 'react';

import { classes } from '../../src/lib/classNames.js';
import { TextInputControl } from './parts/TextInputControl.js';
import { TextInputLabel } from './parts/TextInputLabel.js';
import { TextInputMessage } from './parts/TextInputMessage.js';
import type { TextInputProps } from './TextInput.types.js';

/** A labelled native single-line field with composable adornments and messaging. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    id: suppliedId,
    label,
    labelSuffix,
    helperText,
    error = false,
    errorMessage,
    leadingContent,
    trailingContent,
    variant = 'default',
    inputSize,
    className,
    classNames,
    disabled,
    readOnly,
    'aria-describedby': suppliedDescribedBy,
    'aria-label': ariaLabel,
    ...inputProps
  },
  ref,
) {
  const reactId = useId();
  const inputId = suppliedId ?? `text-input-${reactId}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = classes(
    suppliedDescribedBy,
    error && errorMessage ? errorId : undefined,
    !error && helperText ? helperId : undefined,
  );

  return (
    <div
      data-component="text-input"
      data-variant={variant}
      data-state={error ? 'error' : disabled ? 'disabled' : readOnly ? 'read-only' : 'enabled'}
      className={classes('grid min-w-0 gap-2xs', classNames?.root, className)}
    >
      <TextInputLabel inputId={inputId} label={label} suffix={labelSuffix} classNames={classNames} />
      <TextInputControl
        {...inputProps}
        ref={ref}
        id={inputId}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={error || undefined}
        disabled={disabled}
        readOnly={readOnly}
        inputSize={inputSize}
        variant={variant}
        leadingContent={leadingContent}
        trailingContent={trailingContent}
        classNames={classNames}
      />
      <TextInputMessage
        helperId={helperId}
        errorId={errorId}
        helperText={helperText}
        error={error}
        errorMessage={errorMessage}
        classNames={classNames}
      />
    </div>
  );
});
