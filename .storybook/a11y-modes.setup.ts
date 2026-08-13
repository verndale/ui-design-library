import { afterEach, expect } from 'vitest';

declare const __A11Y_MODES__: boolean;

const focusable = 'a[href], button, input, select, textarea, [tabindex]';

function visible(element: HTMLElement) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

afterEach(() => {
  if (!__A11Y_MODES__) return;

  const viewportWidth = document.documentElement.clientWidth;
  expect(document.documentElement.scrollWidth, '320px mode must not create page-level horizontal overflow').toBeLessThanOrEqual(viewportWidth + 1);

  for (const element of document.querySelectorAll<HTMLElement>('[aria-controls], [aria-describedby], [aria-labelledby]')) {
    for (const attribute of ['aria-controls', 'aria-describedby', 'aria-labelledby'] as const) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      for (const id of value.trim().split(/\s+/)) {
        expect(document.getElementById(id), `${attribute} must resolve #${id}`).not.toBeNull();
      }
    }
  }

  for (const region of document.querySelectorAll<HTMLElement>('[aria-live]')) {
    expect(['polite', 'assertive']).toContain(region.getAttribute('aria-live'));
    expect(region, 'live regions must announce one atomic update').toHaveAttribute('aria-atomic', 'true');
    expect(region.parentElement?.closest('[aria-live]'), 'live regions must not be nested and double-announced').toBeNull();
  }

  for (const branch of document.querySelectorAll<HTMLElement>('[inert]')) {
    for (const target of branch.querySelectorAll<HTMLElement>(focusable)) {
      const before = document.activeElement;
      target.focus();
      expect(target, 'an inert branch must contain no reachable focus target').not.toBe(document.activeElement);
      if (before instanceof HTMLElement) before.focus();
    }
  }

  const targets = [...document.querySelectorAll<HTMLElement>('a[href], button, input:not([type="hidden"]), [role="button"], [role="tab"]')]
    .filter((element) => visible(element) && !element.closest('[inert], [aria-hidden="true"]'));
  for (const target of targets) {
    const rect = target.getBoundingClientRect();
    if (rect.width >= 24 && rect.height >= 24) continue;
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const separated = targets.every((other) => {
      if (other === target) return true;
      const otherRect = other.getBoundingClientRect();
      const otherCenter = { x: otherRect.left + otherRect.width / 2, y: otherRect.top + otherRect.height / 2 };
      return Math.hypot(center.x - otherCenter.x, center.y - otherCenter.y) >= 24;
    });
    expect(separated, 'sub-24px pointer targets require the WCAG 2.5.8 spacing exception').toBe(true);
  }

  expect(matchMedia('(forced-colors: active)').matches, 'accessibility modes must exercise forced colors').toBe(true);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  for (const target of targets.filter((element) => !element.matches(':disabled, [aria-disabled="true"]'))) {
    target.focus();
    expect(target, 'keyboard focus must reach every active control').toBe(document.activeElement);
    const rect = target.getBoundingClientRect();
    expect(rect.bottom, 'focused controls must not be obscured above the viewport').toBeGreaterThan(0);
    expect(rect.top, 'focused controls must not be obscured below the viewport').toBeLessThan(innerHeight);
    if (target.matches(':focus-visible')) {
      const style = getComputedStyle(target);
      expect(parseFloat(style.outlineWidth), 'forced-colors focus indicators must stay visible').toBeGreaterThanOrEqual(1);
      expect(style.outlineStyle).not.toBe('none');
    }
  }

  for (const graphic of document.querySelectorAll<SVGElement>('[data-component] svg')) {
    const hidden = graphic.getAttribute('aria-hidden') === 'true' || graphic.closest('[aria-hidden="true"]');
    expect(hidden, 'decorative component graphics must remain outside the accessibility tree').toBeTruthy();
  }
});
