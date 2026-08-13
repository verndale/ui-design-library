import type { ReactNode } from 'react';

/** The independently scrollable dialog content branch remains keyboard reachable. */
export function ModalBody({ children }: { children?: ReactNode }) {
  return (
    <div tabIndex={0} className="min-h-0 flex-1 overflow-y-auto px-page-margin pb-l">
      {children}
    </div>
  );
}
