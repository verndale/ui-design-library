import type { AlertProps } from './Alert.types.js';
import { AlertFrame } from './parts/AlertFrame.js';
import { DismissibleAlert } from './parts/DismissibleAlert.client.js';

export type { AlertProps, AlertVariant, DismissibleAlertProps } from './Alert.types.js';

/** A server-safe page-level notification with severity announced by its live region. */
export function Alert(props: AlertProps) {
  if (props.onDismiss) return <DismissibleAlert {...props} onDismiss={props.onDismiss} />;
  const { children, variant = 'positive', open = true, className, classNames, icon, showAccent = true } = props;
  if (!open) return null;

  return (
    <AlertFrame variant={variant} className={className} classNames={classNames} icon={icon} showAccent={showAccent}>
      {children}
    </AlertFrame>
  );
}
