'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

let overlays: symbol[] = [];
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function register(id: symbol) {
  overlays = [...overlays.filter((candidate) => candidate !== id), id];
  emit();
  return () => {
    const next = overlays.filter((candidate) => candidate !== id);
    if (next.length === overlays.length) return;
    overlays = next;
    emit();
  };
}

export function getTopOverlay(): symbol | undefined {
  return overlays[overlays.length - 1];
}

export function useOverlayStack(enabled: boolean) {
  const [id] = useState(() => Symbol('overlay'));
  useSyncExternalStore(subscribe, () => version, () => 0);

  useEffect(() => {
    if (!enabled) return;
    return register(id);
  }, [enabled, id]);

  return { id, isTopmost: enabled && getTopOverlay() === id };
}

let scrollLocks = 0;
let previousOverflow: { html: string; body: string } | null = null;

function acquireScrollLock() {
  if (scrollLocks === 0) {
    const { documentElement, body } = document;
    previousOverflow = { html: documentElement.style.overflow, body: body.style.overflow };
    documentElement.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  }
  scrollLocks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks !== 0 || previousOverflow === null) return;
    document.documentElement.style.overflow = previousOverflow.html;
    document.body.style.overflow = previousOverflow.body;
    previousOverflow = null;
  };
}

export function useDocumentScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    return acquireScrollLock();
  }, [enabled]);
}
