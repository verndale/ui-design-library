import type { ReactNode } from 'react';

export function ModalFooter({ children, className }: { children?: ReactNode; className?: string }) {
  return children ? (
    <footer className={['shrink-0 border-t border-border-subtle px-page-margin py-m', className].filter(Boolean).join(' ')}>{children}</footer>
  ) : null;
}
