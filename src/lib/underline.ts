/**
 * Animated underline, driven by a Tailwind `group` on an ancestor.
 *
 * Drawn with `background-size` rather than `text-decoration` so it can be
 * animated, plus `box-decoration-break: clone` so **every wrapped line gets its
 * own underline** instead of one rule spanning the whole inline box. The shared
 * utility keeps that behavior consistent across link-like components.
 *
 * Only `background-size` transitions; the position snaps, so the underline draws
 * left-to-right on the way in and clears left-to-right on the way out without the
 * trailing edge sliding.
 *
 * **It must sit on an inner `<span>`.** Applying it to a flex or grid item, a
 * heading, or an `inline-flex` child blockifies the box, and only the last line
 * gets underlined.
 */

const base = [
  'inline min-w-0 max-w-full no-underline',
  'box-decoration-clone [-webkit-box-decoration-break:clone]',
  'bg-[image:linear-gradient(currentColor,currentColor)] bg-no-repeat',
  'bg-[length:0%_1px] bg-[position:100%_100%]',
  'transition-[background-size] duration-(--duration-base) ease-standard motion-reduce:transition-none',
].join(' ');

const expand = [
  'group-hover:bg-[length:100%_1px] group-hover:bg-[position:0%_100%]',
  'group-focus-visible:bg-[length:100%_1px] group-focus-visible:bg-[position:0%_100%]',
].join(' ');

/** Collapse the underline when the wrapper is marked disabled. */
const collapse = 'group-aria-disabled:bg-[length:0%_1px] group-aria-disabled:bg-[position:100%_100%]';

/** Default: the `group` sits on the link or control wrapping the label span. */
export const animatedUnderline = [base, expand, collapse].join(' ');

/**
 * For a card whose `group` is on the container and whose focusable element is a
 * stretched overlay link — the title underlines when that link is focused.
 */
export const animatedUnderlineFromOverlayLink = [
  base,
  expand,
  'group-has-[a:focus-visible]:bg-[length:100%_1px] group-has-[a:focus-visible]:bg-[position:0%_100%]',
].join(' ');
