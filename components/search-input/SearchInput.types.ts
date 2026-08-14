import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type SearchInputClassNames = SlotClassNames<
  'root' | 'form' | 'label' | 'input' | 'controls' | 'clearButton' | 'clearIcon' | 'submitButton' | 'submitIcon' | 'results'
>;

export type SearchInputProps = {
  /** Visual placeholder. The accessible name comes from `label`. */
  placeholder?: string;
  label?: string;
  /** Accessible name for the search landmark. Change it when a page has multiple search regions. */
  ariaLabel?: string;
  /** Show the bound label visually. It remains available to assistive technology when false. */
  showLabel?: boolean;
  /** Native form field name. */
  name?: string;
  /** Fired with the trimmed query on submit; a blank query does not fire. */
  onSearch?: (query: string) => void;
  className?: string;
  /** Controlled query. Pair with `onChange`; omit both to run uncontrolled. */
  value?: string;
  onChange?: (value: string) => void;
  /** Focus the input on mount, e.g. when a search panel opens. */
  autoFocus?: boolean;
  /** Results or suggestions announced in a polite live region. */
  results?: ReactNode;
  inputId?: string;
  clearLabel?: string;
  submitLabel?: string;
  resultsLabel?: string;
  clearIcon?: ReactNode;
  submitIcon?: ReactNode;
  showClearButton?: boolean;
  showSubmitButton?: boolean;
  classNames?: SearchInputClassNames;
};
