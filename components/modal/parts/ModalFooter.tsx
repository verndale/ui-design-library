import type { ReactNode } from 'react';

export function ModalFooter({ children }: { children?: ReactNode }) {
  return children ? (
    <footer className="shrink-0 border-t border-border-subtle px-page-margin py-m">{children}</footer>
  ) : null;
}
