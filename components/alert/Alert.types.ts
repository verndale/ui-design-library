import type { ReactNode } from 'react';

export type AlertVariant = 'positive' | 'critical';

export type AlertProps = {
  /** The message. */
  children: ReactNode;
  /** Severity — drives live-region politeness, icon, and tone. */
  variant?: AlertVariant;
  /** Whether the alert is shown. */
  open?: boolean;
  className?: string;
};

export type DismissibleAlertProps = AlertProps & {
  /** Called by the dismiss control and when the optional timer elapses. */
  onDismiss: () => void;
  /** Accessible label for the dismiss control. */
  dismissLabel?: string;
  /** Auto-dismiss after this many ms. `0`/omitted keeps it visible. */
  dismissMs?: number;
};
