'use client';

import { useEffect } from 'react';

let users = 0;
let observer: MutationObserver | null = null;
const previous = new Map<HTMLElement, boolean>();

function syncBackground() {
  for (const child of document.body.children) {
    if (!(child instanceof HTMLElement) || child.matches('[data-ui-overlay-layer]')) continue;
    if (!previous.has(child)) previous.set(child, child.inert);
    child.inert = true;
  }
}

function restoreBackground() {
  for (const [element, inert] of previous) {
    if (element.isConnected) element.inert = inert;
  }
  previous.clear();
}

/** Makes non-overlay body content inert while at least one modal dialog is open. */
export function useBackgroundInert(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    users += 1;
    syncBackground();
    if (!observer) {
      observer = new MutationObserver(syncBackground);
      observer.observe(document.body, { childList: true });
    }
    return () => {
      users -= 1;
      if (users > 0) {
        syncBackground();
        return;
      }
      observer?.disconnect();
      observer = null;
      restoreBackground();
    };
  }, [enabled]);
}
