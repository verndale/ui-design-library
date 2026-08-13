import type { ReactNode } from 'react';

/** The independently scrollable dialog content branch remains keyboard reachable. */
export function ModalBody({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div tabIndex={0} className={['min-h-0 flex-1 overflow-y-auto px-page-margin pb-l', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
