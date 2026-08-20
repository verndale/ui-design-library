'use client';

import { useRef, type PointerEvent, type TouchEvent } from 'react';

export const IN_PAGE_NAVIGATION_SWIPE_THRESHOLD_PX = 48;

type Point = { x: number; y: number };
type Direction = 'up' | 'down';

export function crossesVerticalSwipeThreshold(start: Point, end: Point, direction: Direction): boolean {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (Math.abs(deltaY) <= Math.abs(deltaX)) return false;
  return direction === 'up'
    ? deltaY < -IN_PAGE_NAVIGATION_SWIPE_THRESHOLD_PX
    : deltaY > IN_PAGE_NAVIGATION_SWIPE_THRESHOLD_PX;
}

/** A strict, vertical 48px boundary. Exactly 48px remains below threshold. */
export function useVerticalSwipe<T extends HTMLElement>(direction: Direction, onSwipe: () => void) {
  const origin = useRef<Point | null>(null);
  const start = (point: Point) => { origin.current = point; };
  const finish = (point: Point) => {
    const initial = origin.current;
    origin.current = null;
    if (!initial || !crossesVerticalSwipeThreshold(initial, point, direction)) return false;
    onSwipe();
    return true;
  };
  const cancel = () => { origin.current = null; };

  return {
    onPointerDown: (event: PointerEvent<T>) => {
      if (event.pointerType === 'touch') return;
      start({ x: event.clientX, y: event.clientY });
    },
    onPointerUp: (event: PointerEvent<T>) => {
      if (event.pointerType === 'touch') return;
      const swiped = finish({ x: event.clientX, y: event.clientY });
      if (swiped) event.preventDefault();
    },
    onPointerCancel: cancel,
    onTouchStart: (event: TouchEvent<T>) => {
      const touch = event.touches[0];
      if (touch) start({ x: touch.clientX, y: touch.clientY });
    },
    onTouchEnd: (event: TouchEvent<T>) => {
      const touch = event.changedTouches[0];
      if (touch && finish({ x: touch.clientX, y: touch.clientY })) event.preventDefault();
    },
    onTouchCancel: cancel,
  };
}
