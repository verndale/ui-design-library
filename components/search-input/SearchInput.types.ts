import type { ReactNode } from 'react';

export type SearchInputProps = {
  /** Accessible name and placeholder for the field. */
  placeholder?: string;
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
};
