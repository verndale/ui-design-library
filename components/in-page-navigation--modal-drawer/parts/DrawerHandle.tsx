import type { ReactNode } from 'react';

export function DrawerHandle({ icon }: { icon?: ReactNode }) {
  return icon ?? <span className="block h-3xs w-xl rounded-pill bg-border-subtle" />;
}
