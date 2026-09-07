import { useState } from 'react';

import { TextInput } from '../../text-input/index.js';
import { classes } from '../../../src/lib/classNames.js';
import type { DatepickerClassNames } from '../Datepicker.types.js';
import { formatDate, parseDate } from '../lib/dateMath.js';

function CalendarGlyph() {
  return <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v4M18 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" /></svg>;
}

export function DatepickerField({
  value,
  onCommit,
  onOpen,
  open,
  label,
  name,
  helperText,
  error,
  errorMessage,
  disabled,
  readOnly,
  required,
  placeholder,
  controlsId,
  triggerRef,
  classNames,
}: {
  value: Date | null;
  onCommit: (value: Date | null) => void;
  onOpen: () => void;
  open: boolean;
  label?: React.ReactNode;
  name?: string;
  helperText?: React.ReactNode;
  error: boolean;
  errorMessage?: React.ReactNode;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  placeholder: string;
  controlsId: string;
  triggerRef?: React.Ref<HTMLButtonElement>;
  classNames?: DatepickerClassNames;
}) {
  const [draft, setDraft] = useState(() => formatDate(value));
  const commit = () => onCommit(draft.trim() ? parseDate(draft) : null);
  return (
    <TextInput
      label={label}
      name={name}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          if (draft === formatDate(value)) onOpen();
          else commit();
        }
      }}
      helperText={helperText}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      placeholder={placeholder}
      inputMode="numeric"
      className={classNames?.field}
      trailingContent={<button
        ref={triggerRef}
        type="button"
        aria-label="Choose date"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? controlsId : undefined}
        disabled={disabled || readOnly}
        onClick={onOpen}
        className={classes('flex size-(--size-touch-small) items-center justify-center rounded-pill text-text-secondary hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-border-focus', classNames?.trigger)}
      ><CalendarGlyph /></button>}
    />
  );
}
