import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type AlertClassNames = SlotClassNames<'root' | 'accent' | 'icon' | 'content' | 'dismiss'>;

export type AlertVariant = 'positive' | 'critical';

export type AlertProps = {
  /** The message. */
  children: ReactNode;
  /** Severity — drives live-region politeness, icon, and tone. */
  variant?: AlertVariant;
  /** Whether the alert is shown. */
  open?: boolean;
  className?: string;
  classNames?: AlertClassNames;
  /** `undefined` keeps the tone icon; `null` omits it. */
  icon?: ReactNode | null;
  showAccent?: boolean;
  /** Adds the keyboard-operable dismiss control when supplied. */
  onDismiss?: () => void;
  /** Accessible label for the optional dismiss control. */
  dismissLabel?: string;
  /** Auto-dismiss after this many ms. `0`/omitted keeps it visible. */
  dismissMs?: number;
};

export type DismissibleAlertProps = AlertProps & { onDismiss: () => void };
