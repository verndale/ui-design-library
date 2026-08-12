'use client';

import { useEffect, useState } from 'react';

import type { InPageNavigationItem } from '../InPageNavigation.types';

export function useActiveSection(
  items: InPageNavigationItem[],
  controlledId?: string,
): string | undefined {
  const [spied, setSpied] = useState<string>();

  useEffect(() => {
    if (controlledId !== undefined || typeof IntersectionObserver === 'undefined') return;
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (inView[0]) setSpied(inView[0].target.id);
      },
      { rootMargin: '0px 0px -55% 0px', threshold: [0, 0.5, 1] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items, controlledId]);

  return controlledId ?? spied;
}
