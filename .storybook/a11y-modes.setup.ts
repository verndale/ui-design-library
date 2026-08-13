import { afterEach, beforeEach, expect } from 'vitest';

declare const __A11Y_MODES__: boolean;
const accessibilityModesEnabled = typeof __A11Y_MODES__ !== 'undefined' && __A11Y_MODES__;

const focusable = 'a[href], button, input, select, textarea, [tabindex]';
const modeStyleId = 'ui-design-library-accessibility-modes';

beforeEach(() => {
  if (!accessibilityModesEnabled) return;
  document.getElementById(modeStyleId)?.remove();
  const style = document.createElement('style');
  style.id = modeStyleId;
  style.textContent = `
    html { font-size: 200% !important; }
    body, body * {
      letter-spacing: 0.12em !important;
      line-height: 1.5 !important;
      word-spacing: 0.16em !important;
    }
    body p { margin-block-end: 2em !important; }
  `;
  document.head.append(style);
});

function visible(element: HTMLElement) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

afterEach(() => {
  if (!accessibilityModesEnabled) return;

  const viewportWidth = document.documentElement.clientWidth;
  expect(document.documentElement.scrollWidth, '320px mode must not create page-level horizontal overflow').toBeLessThanOrEqual(viewportWidth + 1);

  expect(parseFloat(getComputedStyle(document.documentElement).fontSize), '200% text resize must apply at the rem root').toBeGreaterThanOrEqual(32);
  const textElements = document.querySelectorAll<HTMLElement>('body :is(p, li, label, button, a, h1, h2, h3, h4, h5, h6)');
  for (const element of textElements) {
    if (!visible(element) || !element.textContent?.trim()) continue;
    const style = getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    expect(parseFloat(style.lineHeight), 'text spacing must allow line height of at least 1.5 times font size').toBeGreaterThanOrEqual(fontSize * 1.5 - 0.5);
    expect(parseFloat(style.letterSpacing), 'text spacing must allow letter spacing of at least 0.12 times font size').toBeGreaterThanOrEqual(fontSize * 0.12 - 0.5);
    expect(parseFloat(style.wordSpacing), 'text spacing must allow word spacing of at least 0.16 times font size').toBeGreaterThanOrEqual(fontSize * 0.16 - 0.5);
  }
  for (const paragraph of document.querySelectorAll<HTMLElement>('body p')) {
    if (!visible(paragraph)) continue;
    const style = getComputedStyle(paragraph);
    expect(parseFloat(style.marginBlockEnd), 'text spacing must allow paragraph spacing of at least twice font size').toBeGreaterThanOrEqual(parseFloat(style.fontSize) * 2 - 0.5);
  }

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
  document.getElementById(modeStyleId)?.remove();
});
