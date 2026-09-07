import { useCallback, useEffect, useRef, useState } from 'react';

import { startOfMonth } from '../lib/dateMath.js';

export function useDatepicker(initialMonth: Date, onOpenChange?: (open: boolean) => void) {
  const [open, setOpenState] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(initialMonth));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const setOpen = useCallback((next: boolean) => {
    setOpenState((current) => {
      if (current !== next) onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  return { open, setOpen, month, setMonth, rootRef, triggerRef };
}
