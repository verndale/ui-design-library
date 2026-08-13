'use client';

import { useEffect, useState } from 'react';

/** Resolve the portal host after hydration; the server and first client render return null. */
export function usePortalRoot(): HTMLElement | null {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setPortalRoot(document.body), 0);
    return () => clearTimeout(timer);
  }, []);
  return portalRoot;
}
