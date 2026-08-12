import { useEffect } from 'react';

/** Arm and clean up the optional auto-dismiss timer. */
export function useToastDismiss({
  open,
  dismissMs,
  onDismiss,
}: {
  open: boolean;
  dismissMs: number;
  onDismiss?: () => void;
}) {
  useEffect(() => {
    if (!open || !dismissMs || !onDismiss) return;
    const timer = setTimeout(onDismiss, dismissMs);
    return () => clearTimeout(timer);
  }, [dismissMs, onDismiss, open]);
}
